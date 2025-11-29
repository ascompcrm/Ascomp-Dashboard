import dotenv from 'dotenv'
import { PrismaClient, ServiceStatus, Role } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '../web/.env'),
})

const prisma = new PrismaClient()

// Helper function to generate MongoDB-style ObjectId
function generateObjectId(): string {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
}

// Parse date from format "Monday, January 01, 2024"
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '' || dateStr === 'x' || dateStr === '-') return null
  
  try {
    // Remove day name and parse
    const datePart = dateStr.replace(/^[^,]+,?\s*/, '').trim()
    const date = new Date(datePart)
    if (isNaN(date.getTime())) return null
    return date
  } catch {
    return null
  }
}

// Convert string to number, handling empty values
function toNumber(value: string | undefined): number | null {
  if (!value || value === '-' || value === 'x' || value.trim() === '') return null
  const num = parseFloat(value)
  return isNaN(num) ? null : num
}

// Convert string to integer
function toInt(value: string | undefined): number | null {
  if (!value || value === '-' || value === 'x' || value.trim() === '') return null
  const num = parseInt(value, 10)
  return isNaN(num) ? null : num
}

// Convert boolean-like values
function toBoolean(value: string | undefined): boolean {
  if (!value || value === '-' || value === 'x') return false
  const upper = value.toUpperCase()
  return upper === 'YES' || upper === 'OK' || upper === 'TRUE' || upper === '1'
}

// Clean string value
function cleanString(value: string | undefined): string | null {
  if (!value || value === '-' || value === 'x' || value.trim() === '') return null
  return value.trim()
}

// Combine multiple remark fields
function combineRemarks(row: any): string | null {
  const remarks = [
    row['Remark_1'],
    row['Remark_2'],
    row['Remark_3'],
    row['Remark_4'],
    row['Remark_5'],
    row['Remark_6'],
  ]
    .filter(r => r && r !== '-' && r !== 'x' && r.trim() !== '')
    .map(r => r.trim())
  
  return remarks.length > 0 ? remarks.join(' | ') : null
}

// Create recommended parts JSON
function createRecommendedParts(row: any): any {
  const parts: any[] = []
  
  for (let i = 1; i <= 6; i++) {
    const partName = row[`P${i}`]
    const partNumber = row[`PN${i}`]
    
    if (partName && partName !== '-' && partName !== 'x' && partName.trim() !== '') {
      parts.push({
        name: partName.trim(),
        partNumber: partNumber && partNumber !== '-' && partNumber !== 'x' ? partNumber.trim() : null,
      })
    }
  }
  
  return parts.length > 0 ? parts : null
}

// Process image URL
function processImageUrl(url: string | undefined): string[] {
  if (!url || url === '-' || url === 'x' || url.trim() === '') return []
  return [url.trim()]
}

async function main() {
  console.log('🚀 Starting CSV import...')
  
  const csvPath = path.resolve(__dirname, 'Details.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`)
    process.exit(1)
  }
  
  console.log('📖 Reading CSV file...')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })
  
  console.log(`📊 Found ${records.length} rows to process`)
  
  // Track unique sites, projectors, and users
  const sitesMap = new Map<string, any>()
  const projectorsMap = new Map<string, any>()
  const usersMap = new Map<string, any>()
  const serviceRecords: any[] = []
  const projectorServiceCounts = new Map<string, number>()
  
  // Track service numbers per projector (for counting, but we use text from CSV)
  
  console.log('🔄 Processing rows...')
  
  for (let i = 0; i < records.length; i++) {
    const row = records[i] as Record<string, any>
    
    if (i % 100 === 0) {
      console.log(`  Processing row ${i + 1}/${records.length}...`)
    }
    
    // Skip test/invalid rows
    if (row['Cinema Name'] === 'Test Record' || 
        row['Serial No.'] === 'x' || 
        !row['Serial No.'] ||
        row['Serial No.'].trim() === '') {
      continue
    }
    
    // Process Site
    const address = cleanString(row['Address'])
    if (!address) continue
    
    if (!sitesMap.has(address)) {
      sitesMap.set(address, {
        id: generateObjectId(),
        siteName: cleanString(row['Cinema Name']) || 'Unknown',
        address: address,
        contactDetails: cleanString(row['Contact Details ']) || cleanString(row['Contact Details']) || '',
        screenNo: cleanString(row['Screen No:']) || cleanString(row['Screen No']) || '',
      })
    }
    const site = sitesMap.get(address)!
    
    // Process Projector
    const serialNo = cleanString(row['Serial No.'])
    if (!serialNo) continue
    
    if (!projectorsMap.has(serialNo)) {
      projectorsMap.set(serialNo, {
        id: generateObjectId(),
        projectorModel: cleanString(row['Projector Model']) || 'Unknown',
        serialNo: serialNo,
        runningHours: toInt(row['Projector Number of hours running:']),
        siteId: site.id,
      })
      if (!projectorServiceCounts.has(serialNo)) {
        projectorServiceCounts.set(serialNo, 0)
      }
    }
    const projector = projectorsMap.get(serialNo)!
    
    // Process User (Engineer)
    const engineerName = cleanString(row['Engineer Visited'])
    if (!engineerName) continue // Skip if no engineer
    
    if (!usersMap.has(engineerName)) {
      // Create a simple user record - you may need to adjust this
      // For now, we'll create users on the fly
      const email = `${engineerName.toLowerCase().replace(/\s+/g, '.')}@field.ascomp.com`
      usersMap.set(engineerName, {
        id: generateObjectId(),
        name: engineerName,
        email: email,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: Role.FIELD_WORKER,
      })
    }
    const user = usersMap.get(engineerName)!
    
    // Get service number from CSV (Option C - keep as-is)
    const serviceNumber = cleanString(row['Service Visit']) || 'First'
    
    // Track for counting purposes
    const currentCount = projectorServiceCounts.get(serialNo) || 0
    projectorServiceCounts.set(serialNo, currentCount + 1)
    
    // Process Service Record
    const serviceDate = parseDate(row['Date'])
    
    // Combine EVB and IMCB boards
    const evbBoard = cleanString(row['EVB Board'])
    const imcbBoard = cleanString(row['IMCB Board/s'])
    const evbImcbBoard = [evbBoard, imcbBoard].filter(Boolean).join(' / ') || null
    
    // Combine PIB and ICP boards
    const pibBoard = cleanString(row['PIB Board'])
    const icpBoard = cleanString(row['ICP Board'])
    const pibIcpBoard = [pibBoard, icpBoard].filter(Boolean).join(' / ') || null
    
    // Import both 2K and 4K color values
    const white2Kx = toNumber(row['W2Kx']) || toNumber(row['x'])
    const white2Ky = toNumber(row['W2Ky']) || toNumber(row['y'])
    const white2Kfl = toNumber(row['W2Kfl']) || toNumber(row['fl'])
    const white4Kx = toNumber(row['W4Kx']) || toNumber(row['x2'])
    const white4Ky = toNumber(row['W4Ky']) || toNumber(row['y2'])
    const white4Kfl = toNumber(row['W4Kfl']) || toNumber(row['fl2'])
    
    const red2Kx = toNumber(row['R2Kx'])
    const red2Ky = toNumber(row['R2Ky'])
    const red2Kfl = toNumber(row['R2Kfl'])
    const red4Kx = toNumber(row['R4Kx'])
    const red4Ky = toNumber(row['R4Ky'])
    const red4Kfl = toNumber(row['R4Kfl'])
    
    const green2Kx = toNumber(row['G2Kx'])
    const green2Ky = toNumber(row['G2Ky'])
    const green2Kfl = toNumber(row['G2Kfl'])
    const green4Kx = toNumber(row['G4Kx'])
    const green4Ky = toNumber(row['G4Ky'])
    const green4Kfl = toNumber(row['G4Kfl'])
    
    const blue2Kx = toNumber(row['B2Kx'])
    const blue2Ky = toNumber(row['B2Ky'])
    const blue2Kfl = toNumber(row['B2Kfl'])
    const blue4Kx = toNumber(row['B4Kx'])
    const blue4Ky = toNumber(row['B4Ky'])
    const blue4Kfl = toNumber(row['B4Kfl'])
    
    // Import Scope and Flat dimensions separately
    const screenHeight = toNumber(row['Scope_H'])
    const screenWidth = toNumber(row['Scope_W'])
    const flatHeight = toNumber(row['Flat_H'])
    const flatWidth = toNumber(row['Flat_W'])
    
    const serviceRecord = {
      id: generateObjectId(),
      userId: user.id,
      assignedToId: user.id,
      projectorId: projector.id,
      siteId: site.id,
      serviceNumber: serviceNumber,
      status: ServiceStatus.COMPLETED, // Historical data is completed
      date: serviceDate,
      createdAt: serviceDate || new Date(),
      updatedAt: new Date(),
      
      // Basic info
      cinemaName: cleanString(row['Cinema Name']),
      address: address,
      contactDetails: cleanString(row['Contact Details ']) || cleanString(row['Contact Details']),
      location: cleanString(row['Room']),
      screenNumber: cleanString(row['Screen No:']) || cleanString(row['Screen No']),
      projectorRunningHours: toInt(row['Projector Number of hours running:']),
      
      // Optical components
      reflector: cleanString(row['Reflector']),
      uvFilter: cleanString(row['UV filter']) || cleanString(row['UV Filter']),
      integratorRod: cleanString(row['Integrator Rod']),
      coldMirror: cleanString(row['Cold Mirror']),
      foldMirror: cleanString(row['Fold Mirror']),
      
      // Electronic components
      touchPanel: cleanString(row['Touch Panel']),
      evbImcbBoard: evbImcbBoard,
      pibIcpBoard: pibIcpBoard,
      imbSBoard: cleanString(row['IMB/S Board']),
      serialNumberVerified: toBoolean(row['Chassis label vs Touch Panel']),
      
      // Light engine
      coolantLevelColor: cleanString(row['Level and Color']),
      lightEngineWhite: cleanString(row['White']),
      lightEngineRed: cleanString(row['Red']),
      lightEngineGreen: cleanString(row['Green']),
      lightEngineBlue: cleanString(row['Blue']),
      lightEngineBlack: cleanString(row['Black']),
      
      // Mechanical
      acBlowerVane: cleanString(row['AC blower and Vane Switch']),
      extractorVane: cleanString(row['Extractor Vane Switch']),
      exhaustCfm: cleanString(row['Exhaust CFM']),
      lightEngineFans: cleanString(row['Light Engine 4 fans with LAD fan']),
      cardCageFans: cleanString(row['Card Cage Top and Bottom fans']),
      radiatorFanPump: cleanString(row['Radiator fan and Pump']),
      pumpConnectorHose: cleanString(row['Connector and hose for the Pump']),
      securityLampHouseLock: cleanString(row['Security and lamp house lock switch']),
      lampLocMechanism: cleanString(row['Lamp LOC Mechanism X,Y and Z movement']),
      
      // Lamp info
      lampMakeModel: cleanString(row['Lamp Model & Make']),
      lampTotalRunningHours: toInt(row['Lamp Number of hours running:']),
      lampCurrentRunningHours: toInt(row['Current Lamp Hours']),
      
      // Status
      leStatus: cleanString(row['LE Status']),
      acStatus: cleanString(row['AC Status']),
      lightEngineSerialNumber: cleanString(row['LE S No']),
      
      // Voltage params
      pvVsN: cleanString(row[' P V N']) || cleanString(row['P V N']),
      pvVsE: cleanString(row[' P V E']) || cleanString(row['P V E']),
      nvVsE: cleanString(row['N VS E']),
      flLeft: toNumber(row['  fL_A']) || toNumber(row['fL_A']),
      flRight: toNumber(row['  fL_B']) || toNumber(row['fL_B']),
      
      // Content player
      contentPlayerModel: cleanString(row['Content player model']),
      
      // Screen info
      screenHeight: screenHeight,
      screenWidth: screenWidth,
      flatHeight: flatHeight,
      flatWidth: flatWidth,
      screenGain: toNumber(row['Gain']),
      screenMake: cleanString(row['Screen Make']),
      throwDistance: toNumber(row['Throw Distance']),
      
      // Color measurements - 2K
      white2Kx: white2Kx,
      white2Ky: white2Ky,
      white2Kfl: white2Kfl,
      red2Kx: red2Kx,
      red2Ky: red2Ky,
      red2Kfl: red2Kfl,
      green2Kx: green2Kx,
      green2Ky: green2Ky,
      green2Kfl: green2Kfl,
      blue2Kx: blue2Kx,
      blue2Ky: blue2Ky,
      blue2Kfl: blue2Kfl,
      
      // Color measurements - 4K
      white4Kx: white4Kx,
      white4Ky: white4Ky,
      white4Kfl: white4Kfl,
      red4Kx: red4Kx,
      red4Ky: red4Ky,
      red4Kfl: red4Kfl,
      green4Kx: green4Kx,
      green4Ky: green4Ky,
      green4Kfl: green4Kfl,
      blue4Kx: blue4Kx,
      blue4Ky: blue4Ky,
      blue4Kfl: blue4Kfl,
      
      // Software
      softwareVersion: cleanString(row['Software Version']),
      projectorPlacementEnvironment: cleanString(row['Room']),
      
      // Air quality
      hcho: toNumber(row['HCHO']),
      tvoc: toNumber(row['TVOC']),
      pm1: toNumber(row['PM 1']),
      pm2_5: toNumber(row['PM 2.5']),
      pm10: toNumber(row['PM 10']),
      temperature: toNumber(row['Temperature']),
      humidity: toNumber(row['Humidity']),
      airPollutionLevel: cleanString(row['Air Pollution Level']),
      
      // Boolean fields
      focusBoresight: toBoolean(row['Focus']),
      integratorPosition: toBoolean(row['Intergrator']) || toBoolean(row['Integrator']),
      spotsOnScreen: toBoolean(row['Any Spot on Screen after PPM']),
      screenCroppingOk: toBoolean(row['Check Screen cropping - FLAT and SCOPE']),
      convergenceOk: toBoolean(row['Convergence checked']),
      channelsCheckedOk: toBoolean(row['Channels Checked - Scope, Flat, Alternative']),
      
      // Text fields
      pixelDefects: cleanString(row['Pixel Defects']),
      imageVibration: cleanString(row['Excessive Image Vibration']),
      liteloc: cleanString(row['LiteLOC']),
      remarks: combineRemarks(row),
      
      // Recommended parts
      recommendedParts: createRecommendedParts(row),
      
      // Images
      images: processImageUrl(row['photo']),
      brokenImages: [],
      
      // YES checklist fields
      yes1: cleanString(row['YES1']),
      yes2: cleanString(row['Yes2']) || cleanString(row['YES2']),
      yes3: cleanString(row['YES3']),
      yes4: cleanString(row['YES4']),
      yes5: cleanString(row['YES5']),
      yes6: cleanString(row['YES6']),
      yes7: cleanString(row['YES7']),
      yes8: cleanString(row['YES8']),
      yes9: cleanString(row['YES9']),
      yes10: cleanString(row['YES10']),
      yes11: cleanString(row['YES11']),
      yes12: cleanString(row['YES12']),
      yes13: cleanString(row['YES13']),
      yes14: cleanString(row['YES14']),
      yes15: cleanString(row['YES15']),
      yes16: cleanString(row['YES16']),
      yes17: cleanString(row['YES17']),
      yes18: cleanString(row['YES18']),
      yes19: cleanString(row['YES19']),
      yes20: cleanString(row['YES20']),
      yes21: cleanString(row['YES21']),
      yes22: cleanString(row['YES22']),
      yes23: cleanString(row['YES23']),
      yes24: cleanString(row['YES24']),
      yes25: cleanString(row['YES25']),
      yes26: cleanString(row['YES26']),
      yes27: cleanString(row['YES27']),
      yes28: cleanString(row['YES28']),
      
      // Defaults
      replacementRequired: false,
      startTime: null,
      endTime: null,
      signatures: null,
      reportGenerated: false,
      reportUrl: null,
    }
    
    serviceRecords.push(serviceRecord)
  }
  
  console.log(`\n📦 Summary:`)
  console.log(`  Sites: ${sitesMap.size}`)
  console.log(`  Projectors: ${projectorsMap.size}`)
  console.log(`  Users: ${usersMap.size}`)
  console.log(`  Service Records: ${serviceRecords.length}`)
  
  console.log('\n💾 Saving to database...')
  
  try {
    // Create users first
    console.log('  Creating users...')
    for (const user of usersMap.values()) {
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: user,
        })
      } catch (error: any) {
        // If user exists, fetch it
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })
        if (existingUser) {
          user.id = existingUser.id
        } else {
          console.error(`    Error creating user ${user.email}:`, error.message)
        }
      }
    }
    
    // Update user IDs in service records
    const userEmailMap = new Map<string, string>()
    for (const user of usersMap.values()) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      })
      if (dbUser) {
        userEmailMap.set(user.email, dbUser.id)
      }
    }
    
    // Create sites
    console.log('  Creating sites...')
    for (const site of sitesMap.values()) {
      await prisma.site.upsert({
        where: { address: site.address },
        update: {},
        create: site,
      })
    }
    
    // Create projectors
    console.log('  Creating projectors...')
    for (const projector of projectorsMap.values()) {
      await prisma.projector.upsert({
        where: { serialNo: projector.serialNo },
        update: {
          runningHours: projector.runningHours,
        },
        create: projector,
      })
    }
    
    // Update projector service counts and last service dates
    console.log('  Updating projector service counts...')
    for (const [serialNo, count] of projectorServiceCounts.entries()) {
      const projector = projectorsMap.get(serialNo)!
      const projectorServices = serviceRecords
        .filter(sr => sr.projectorId === projector.id)
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateB - dateA
        })
      
      if (projectorServices.length > 0) {
        const lastService = projectorServices[0]
        await prisma.projector.update({
          where: { id: projector.id },
          data: {
            noOfservices: count,
            lastServiceAt: lastService.date,
          },
        })
      }
    }
    
    // Create service records in batches
    console.log('  Creating service records...')
    const BATCH_SIZE = 100
    for (let i = 0; i < serviceRecords.length; i += BATCH_SIZE) {
      const batch = serviceRecords.slice(i, i + BATCH_SIZE)
      
      // Update user IDs in batch - find user by original user object
      for (const record of batch) {
        // Find the user that matches this record's original user ID
        const originalUser = Array.from(usersMap.values()).find(u => u.id === record.userId)
        if (originalUser) {
          const dbUser = await prisma.user.findUnique({
            where: { email: originalUser.email },
          })
          if (dbUser) {
            record.userId = dbUser.id
            record.assignedToId = dbUser.id
          }
        }
      }
      
      await prisma.serviceRecord.createMany({
        data: batch,
        skipDuplicates: true,
      })
      
      if ((i + BATCH_SIZE) % 500 === 0) {
        console.log(`    Created ${Math.min(i + BATCH_SIZE, serviceRecords.length)}/${serviceRecords.length} records...`)
      }
    }
    
    console.log('\n✅ Import completed successfully!')
    console.log(`\n📊 Final counts:`)
    const finalSites = await prisma.site.count()
    const finalProjectors = await prisma.projector.count()
    const finalServices = await prisma.serviceRecord.count()
    console.log(`  Sites: ${finalSites}`)
    console.log(`  Projectors: ${finalProjectors}`)
    console.log(`  Service Records: ${finalServices}`)
    
  } catch (error) {
    console.error('\n❌ Error during import:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

