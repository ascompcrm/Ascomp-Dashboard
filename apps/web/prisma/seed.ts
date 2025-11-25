import dotenv from 'dotenv'
import { PrismaClient, Role, ServiceStatus } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'
import { auth } from '../src/lib/auth'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

const prisma = new PrismaClient()

// Helper function to generate MongoDB-style ObjectId
function generateObjectId(): string {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
}

// Helper function to get date X months ago
function monthsAgo(months: number): Date {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date
}

// Helper function to get date X months from now
function monthsFromNow(months: number): Date {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.serviceRecord.deleteMany({})
  await prisma.projector.deleteMany({})
  await prisma.site.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.user.deleteMany({})

  // Create Admin User using better-auth API
  console.log('👤 Creating admin user...')
  // Use better-auth's internal API handler
  // Better-auth handler expects the full path
  const adminRequest = new Request('http://localhost/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@crm.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN',
    }),
  })
  const adminResponse = await auth.handler(adminRequest)
  
  if (!adminResponse.ok) {
    const errorText = await adminResponse.text()
    throw new Error(`Failed to create admin user: ${adminResponse.status} ${errorText}`)
  }
  
  const adminData: any = await adminResponse.json()
  
  if (!adminData || !adminData.user) {
    throw new Error('Failed to create admin user: ' + JSON.stringify(adminData))
  }

  // Update role if not set during signup
  const admin = await prisma.user.update({
    where: { id: adminData.user.id },
    data: { role: Role.ADMIN },
  })
  console.log('✅ Admin created:', admin.email)

  // Create Field Workers
  console.log('👷 Creating field workers...')
  const FIELD_WORKER_COUNT = 30
  const fieldWorkers = Array.from({ length: FIELD_WORKER_COUNT }).map((_, index) => {
    const firstNames = ['John', 'Jane', 'David', 'Priya', 'Arjun', 'Maya', 'Rahul', 'Sneha', 'Aman', 'Kavya']
    const lastNames = ['Sharma', 'Patel', 'Iyer', 'Khan', 'Singh', 'Das', 'Menon', 'Verma', 'Rao', 'Ghosh']
    const first = firstNames[index % firstNames.length]
    const last = lastNames[(index * 3) % lastNames.length]
    return {
      name: `${first} ${last}`,
      email: `${first!.toLowerCase()}.${last!.toLowerCase()}${index + 1}@field.ascomp.com`,
    }
  })

  // Create Field Workers using better-auth API
  const createdFieldWorkers = await Promise.all(
    fieldWorkers.map(async (worker) => {
      const signUpRequest = new Request('http://localhost/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: worker.email,
          password: 'password123',
          name: worker.name,
          role: 'FIELD_WORKER',
        }),
      })
      const signUpResponse = await auth.handler(signUpRequest)
      
      if (!signUpResponse.ok) {
        const errorText = await signUpResponse.text()
        throw new Error(`Failed to create field worker ${worker.email}: ${signUpResponse.status} ${errorText}`)
      }
      
      const signUpData: any = await signUpResponse.json()

      if (!signUpData || !signUpData.user) {
        throw new Error(`Failed to create field worker: ${worker.email} - ${JSON.stringify(signUpData)}`)
      }

      // Update role if not set during signup
      const user = await prisma.user.update({
        where: { id: signUpData.user.id },
        data: { role: Role.FIELD_WORKER },
      })

      return user
    })
  )
  console.log(`✅ Created ${createdFieldWorkers.length} field workers`)

  // Create Sites
  console.log('🏢 Creating sites...')
  const sitesData = [
    {
      siteName: 'Mumbai PVR Phoenix Mall',
      address: 'Phoenix Marketcity, Kurla West, Mumbai, Maharashtra 400070',
      contactDetails: '+91-22-6180-1234',
      screenNo: '5',
    },
    {
      siteName: 'Delhi Cinepolis Ambience',
      address: 'Ambience Mall, Vasant Kunj, New Delhi 110070',
      contactDetails: '+91-11-4686-5678',
      screenNo: '8',
    },
    {
      siteName: 'Bangalore INOX Forum',
      address: 'Forum Mall, Koramangala, Bangalore, Karnataka 560095',
      contactDetails: '+91-80-4111-9999',
      screenNo: '12',
    },
    {
      siteName: 'Hyderabad Prasads Multiplex',
      address: 'Panjagutta, Hyderabad, Telangana 500082',
      contactDetails: '+91-40-2335-7777',
      screenNo: '10',
    },
    {
      siteName: 'Pune Carnival Cinemas',
      address: 'Kalyani Nagar, Pune, Maharashtra 411014',
      contactDetails: '+91-20-2665-1234',
      screenNo: '6',
    },
    {
      siteName: 'Chennai Sathyam Cinemas',
      address: 'Royapettah, Chennai, Tamil Nadu 600014',
      contactDetails: '+91-44-4399-9999',
      screenNo: '9',
    },
    {
      siteName: 'Ahmedabad Cinepolis One Mall',
      address: 'One Mall, Vastrapur, Ahmedabad, Gujarat 380015',
      contactDetails: '+91-79-4000-1111',
      screenNo: '7',
    },
    {
      siteName: 'Kolkata Quest INOX',
      address: 'Quest Mall, Park Circus, Kolkata, West Bengal 700017',
      contactDetails: '+91-33-4400-2233',
      screenNo: '11',
    },
    {
      siteName: 'Lucknow Wave Cinemas',
      address: 'Gomti Nagar, Lucknow, Uttar Pradesh 226010',
      contactDetails: '+91-522-400-9000',
      screenNo: '6',
    },
    {
      siteName: 'Indore Malhar Mega Mall',
      address: 'RRCAT Road, Indore, Madhya Pradesh 452001',
      contactDetails: '+91-731-425-5555',
      screenNo: '4',
    },
    {
      siteName: 'Jaipur WTP Multiplex',
      address: 'World Trade Park, Malviya Nagar, Jaipur, Rajasthan 302017',
      contactDetails: '+91-141-456-8888',
      screenNo: '8',
    },
    {
      siteName: 'Chandigarh Elante Cinemas',
      address: 'Elante Mall, Industrial Area Phase I, Chandigarh 160002',
      contactDetails: '+91-172-500-7000',
      screenNo: '9',
    },
  ]

  const sites = await Promise.all(
    sitesData.map((site) =>
      prisma.site.create({
        data: {
          id: generateObjectId(),
          siteName: site.siteName,
          address: site.address,
          contactDetails: site.contactDetails,
          screenNo: site.screenNo,
        },
      })
    )
  )
  console.log(`✅ Created ${sites.length} sites`)

  // Create Projectors
  console.log('🎥 Creating projectors...')
  const projectorModels = ['CP2220', 'CP2320', 'CP2400', 'CP2500', 'CP2600']
  const projectors: Awaited<ReturnType<typeof prisma.projector.create>>[] = []

  for (const site of sites) {
    const projectorsPerSite = Math.floor(Math.random() * 3) + 3 // 3-5 projectors per site

    for (let j = 0; j < projectorsPerSite; j++) {
      const model =
        projectorModels[Math.floor(Math.random() * projectorModels.length)] || 'CP2220'
      const serialNo = `SN${Math.floor(Math.random() * 900000000) + 100000000}`

      // Calculate service dates
      const lastServiceMonthsAgo = Math.floor(Math.random() * 12) + 1 // 1-12 months ago
      const lastServiceAt = monthsAgo(lastServiceMonthsAgo)
      const nextServiceAt = monthsFromNow(6 - lastServiceMonthsAgo) // 6 months from last service

      const projector = await prisma.projector.create({
        data: {
          id: generateObjectId(),
          projectorModel: model,
          serialNo: serialNo,
          noOfservices: Math.floor(Math.random() * 8) + 2,
          runningHours: Math.floor(Math.random() * 5000) + 1000,
          siteId: site.id,
          lastServiceAt: lastServiceAt,
          nextServiceAt: nextServiceAt,
        },
      })
      projectors.push(projector)
    }
  }
  console.log(`✅ Created ${projectors.length} projectors`)

  // Create Service Records
  console.log('📋 Creating service records...')
  let serviceRecordCount = 0

  const remarksSamples = [
    'Cleaned optics and replaced air filters.',
    'Checked lamp housing; no issues found.',
    'Noted slight vibration on focus panel; to monitor next visit.',
    'Adjusted coolant level and flushed air bubbles.',
    'Replaced touch panel calibration module.',
  ]

  type SiteEntity = (typeof sites)[number]
  type ProjectorEntity = (typeof projectors)[number]

  const createServiceRecord = async ({
    projector,
    site,
    serviceNumber,
    status,
    date,
    assignedToId,
  }: {
    projector: ProjectorEntity
    site: SiteEntity
    serviceNumber: number
    status: ServiceStatus
    date: Date | null
    assignedToId?: string | null
  }) => {
    const randomHours = Math.floor(Math.random() * 2500) + 500
    const remarks = remarksSamples[Math.floor(Math.random() * remarksSamples.length)]
    const siteName = (site.siteName ?? '') as string
    const siteAddress = (site.address ?? '') as string
    const siteContact = (site.contactDetails ?? '') as string
    const siteScreen = (site.screenNo ?? '') as string
    const locationSegment = siteAddress.split(',')[2]?.trim()
    const locationValue =
      locationSegment && locationSegment.length > 0 ? locationSegment : siteAddress

    await prisma.serviceRecord.create({
      data: {
        id: generateObjectId(),
        userId: admin.id,
        assignedToId: assignedToId || null,
        projectorId: projector.id,
        siteId: projector.siteId,
        serviceNumber,
        status,
        date: date,
        cinemaName: siteName,
        address: siteAddress,
        contactDetails: siteContact,
        location: locationValue,
        screenNumber: siteScreen,
        projectorRunningHours: randomHours,
        replacementRequired: Math.random() > 0.7,
        reflector: Math.random() > 0.2 ? 'OK' : 'Needs Replacement',
        uvFilter: Math.random() > 0.2 ? 'OK' : 'Not OK',
        integratorRod: Math.random() > 0.2 ? 'OK' : 'Not OK',
        coldMirror: Math.random() > 0.2 ? 'OK' : 'Not OK',
        foldMirror: Math.random() > 0.2 ? 'OK' : 'Not OK',
        touchPanel: Math.random() > 0.2 ? 'OK' : 'Not OK',
        evbImcbBoard: Math.random() > 0.25 ? 'OK' : 'Not OK',
        pibIcpBoard: Math.random() > 0.25 ? 'OK' : 'Not OK',
        imbSBoard: Math.random() > 0.25 ? 'OK' : 'Not OK',
        serialNumberVerified: Math.random() > 0.1,
        disposableConsumables: Math.random() > 0.5 ? 'Replaced' : 'Cleaned',
        coolantLevelColor: Math.random() > 0.8 ? 'Low' : 'OK',
        lightEngineWhite: Math.random() > 0.2 ? 'OK' : 'Bad',
        lightEngineRed: Math.random() > 0.2 ? 'OK' : 'Bad',
        lightEngineGreen: Math.random() > 0.2 ? 'OK' : 'Bad',
        lightEngineBlue: Math.random() > 0.2 ? 'OK' : 'Bad',
        lightEngineBlack: Math.random() > 0.2 ? 'OK' : 'Bad',
        acBlowerVane: Math.random() > 0.2 ? 'OK' : 'Not OK',
        extractorVane: Math.random() > 0.2 ? 'OK' : 'Not OK',
        exhaustCfm: (Math.floor(Math.random() * 200) + 200).toString(),
        lightEngineFans: Math.random() > 0.2 ? 'OK' : 'Not OK',
        cardCageFans: Math.random() > 0.2 ? 'OK' : 'Not OK',
        radiatorFanPump: Math.random() > 0.2 ? 'OK' : 'Not OK',
        pumpConnectorHose: Math.random() > 0.2 ? 'OK' : 'Not OK',
        securityLampHouseLock: Math.random() > 0.1 ? 'Working' : 'Not Working',
        lampLocMechanism: Math.random() > 0.1 ? 'OK' : 'Not OK',
        projectorPlacementEnvironment: 'Clean booth with controlled temperature',
        softwareVersion: `v${(Math.random() * 3 + 1).toFixed(1)}`,
        screenHeight: parseFloat((Math.random() * 4 + 6).toFixed(2)),
        screenWidth: parseFloat((Math.random() * 8 + 10).toFixed(2)),
        screenGain: parseFloat((Math.random() * 1 + 1).toFixed(2)),
        screenMake: 'Harkness',
        throwDistance: parseFloat((Math.random() * 10 + 15).toFixed(2)),
        lampMakeModel: 'Osram XBO 2000W',
        lampTotalRunningHours: Math.floor(Math.random() * 3000) + 500,
        lampCurrentRunningHours: Math.floor(Math.random() * 2000) + 200,
        pvVsN: (Math.random() * 240).toFixed(1),
        pvVsE: (Math.random() * 240).toFixed(1),
        nvVsE: (Math.random() * 240).toFixed(1),
        flCenter: parseFloat((Math.random() * 4 + 12).toFixed(2)),
        flLeft: parseFloat((Math.random() * 4 + 12).toFixed(2)),
        flRight: parseFloat((Math.random() * 4 + 12).toFixed(2)),
        contentPlayerModel: 'Dolby IMS3000',
        acStatus: Math.random() > 0.1 ? 'Working' : 'Not Working',
        leStatus: Math.random() > 0.2 ? 'Removed' : 'Not removed – Good fL',
        remarks,
        lightEngineSerialNumber: `LE-${Math.floor(Math.random() * 9000) + 1000}`,
        whiteX: parseFloat((Math.random() * 0.1 + 0.3).toFixed(3)),
        whiteY: parseFloat((Math.random() * 0.1 + 0.3).toFixed(3)),
        whiteFl: parseFloat((Math.random() * 4 + 12).toFixed(2)),
        redX: parseFloat((Math.random() * 0.1 + 0.6).toFixed(3)),
        redY: parseFloat((Math.random() * 0.1 + 0.2).toFixed(3)),
        redFl: parseFloat((Math.random() * 2 + 8).toFixed(2)),
        greenX: parseFloat((Math.random() * 0.1 + 0.2).toFixed(3)),
        greenY: parseFloat((Math.random() * 0.1 + 0.6).toFixed(3)),
        greenFl: parseFloat((Math.random() * 2 + 8).toFixed(2)),
        blueX: parseFloat((Math.random() * 0.1 + 0.1).toFixed(3)),
        blueY: parseFloat((Math.random() * 0.1 + 0.1).toFixed(3)),
        blueFl: parseFloat((Math.random() * 2 + 8).toFixed(2)),
        focusBoresight: Math.random() > 0.2,
        integratorPosition: Math.random() > 0.2,
        spotsOnScreen: Math.random() > 0.8,
        screenCroppingOk: Math.random() > 0.1,
        convergenceOk: Math.random() > 0.2,
        channelsCheckedOk: Math.random() > 0.2,
        pixelDefects: Math.random() > 0.8 ? 'Few' : 'None',
        imageVibration: Math.random() > 0.85 ? 'Slight' : 'None',
        liteloc: Math.random() > 0.2 ? 'Working' : 'Not Working',
        hcho: parseFloat((Math.random() * 0.05).toFixed(3)),
        tvoc: parseFloat((Math.random() * 0.5).toFixed(3)),
        pm1: parseFloat((Math.random() * 40).toFixed(2)),
        pm2_5: parseFloat((Math.random() * 60).toFixed(2)),
        pm10: parseFloat((Math.random() * 100).toFixed(2)),
        temperature: parseFloat((Math.random() * 5 + 20).toFixed(2)),
        humidity: parseFloat((Math.random() * 30 + 30).toFixed(2)),
        startTime: date ? new Date(date.getTime() - 1000 * 60 * 90) : new Date(),
        endTime: date ? new Date(date.getTime() - 1000 * 60 * 15) : new Date(),
        createdAt: date || new Date(),
        updatedAt: date || new Date(),
      },
    })
    serviceRecordCount++
  }

  for (const projector of projectors) {
    const site = sites.find((s) => s.id === projector.siteId)
    if (!site) continue

    // Create multiple completed records
    const completedCount = Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < completedCount; i++) {
      const monthsBack = Math.floor(Math.random() * 18) + 3
      const workerForCompleted =
        Math.random() > 0.4
          ? createdFieldWorkers[Math.floor(Math.random() * createdFieldWorkers.length)]
          : null
      await createServiceRecord({
        projector,
        site,
        serviceNumber: i + 1,
        status: ServiceStatus.COMPLETED,
        date: monthsAgo(monthsBack),
        assignedToId: workerForCompleted ? workerForCompleted.id : undefined,
      })
    }

    // Possibly create a pending record
    if (Math.random() > 0.5) {
      await createServiceRecord({
        projector,
        site,
        serviceNumber: completedCount + 1,
        status: ServiceStatus.PENDING,
        date: null,
      })
    }

    // Create scheduled record for future with assigned worker
    if (Math.random() > 0.2) {
      const worker = createdFieldWorkers[Math.floor(Math.random() * createdFieldWorkers.length)]
      if (worker) {
        const futureMonths = Math.floor(Math.random() * 3) + 1
        await createServiceRecord({
          projector,
          site,
          serviceNumber: completedCount + 2,
          status: ServiceStatus.SCHEDULED,
          date: monthsFromNow(futureMonths),
          assignedToId: worker.id,
        })
      }
    }
  }

  console.log(`✅ Created ${serviceRecordCount} service records`)

  // Summary
  console.log('\n📊 Seed Summary:')
  console.log(`   👤 Users: ${(await prisma.user.count())} (1 admin + ${createdFieldWorkers.length} field workers)`)
  console.log(`   🏢 Sites: ${await prisma.site.count()}`)
  console.log(`   🎥 Projectors: ${await prisma.projector.count()}`)
  console.log(`   📋 Service Records: ${await prisma.serviceRecord.count()}`)

  const statusCounts = await prisma.serviceRecord.groupBy({
    by: ['status'],
    _count: true,
  })

  console.log('\n📈 Service Records by Status:')
  statusCounts.forEach((stat) => {
    console.log(`   ${stat.status}: ${stat._count}`)
  })

  console.log('\n✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

