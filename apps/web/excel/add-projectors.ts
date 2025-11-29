import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'
import * as XLSX from 'xlsx'
import * as fs from 'fs'

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

// Clean string value
function cleanString(value: any): string | null {
  if (value === null || value === undefined || value === '') return null
  const str = String(value).trim()
  return str === '' || str === '-' || str === 'x' ? null : str
}

// Set to true to clear existing projectors before adding new ones
const RESET_DATABASE = false

async function main() {
  console.log('🚀 Starting projectors import from Excel...\n')

  const excelPath = path.resolve(__dirname, 'projector-data_v1.xlsx')

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel file not found at: ${excelPath}`)
    process.exit(1)
  }

  // Reset database if requested
  if (RESET_DATABASE) {
    console.log('🗑️  Resetting database (clearing existing projectors)...')
    await prisma.serviceRecord.deleteMany({})
    await prisma.projector.deleteMany({})
    console.log('✅ Database cleared\n')
  }

  console.log('📖 Reading Excel file...')
  const workbook = XLSX.readFile(excelPath)
  
  // Get the first worksheet
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  // Convert to JSON
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    raw: false,
    defval: null,
  })

  console.log(`📊 Found ${rows.length} rows to process\n`)

  // Build a map of Site Code to Site ID for faster lookups
  console.log('🔍 Building site lookup map...')
  const sites = await prisma.site.findMany({
    select: {
      id: true,
      siteCode: true,
      siteName: true,
    },
  })

  const siteCodeMap = new Map<string, { id: string; siteName: string }>()
  for (const site of sites) {
    if (site.siteCode) {
      siteCodeMap.set(site.siteCode, { id: site.id, siteName: site.siteName })
    }
  }

  console.log(`✅ Found ${siteCodeMap.size} sites with site codes\n`)

  const results = {
    created: [] as Array<{ serialNo: string; modelNo: string; siteCode: string; siteName: string }>,
    skipped: [] as Array<{ serialNo: string; reason: string }>,
    errors: [] as Array<{ serialNo: string; error: string }>,
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as any
    try {
      // Get data from Excel columns
      const serialNo = cleanString(row['Projector Serial Number'] || row['Serial Number'] || row['Serial No'])
      const modelNo = cleanString(row['Model No'] || row['Model Number'] || row['Model'])
      const siteCode = cleanString(row['Site Code'] || row['SiteCode'] || row['siteCode'])

      if (i % 50 === 0) {
        console.log(`\n📝 Processing row ${i + 1}/${rows.length}...`)
      }

      if (!serialNo) {
        results.skipped.push({
          serialNo: 'Unknown',
          reason: 'Missing Serial Number',
        })
        continue
      }

      if (!modelNo) {
        results.skipped.push({
          serialNo: serialNo,
          reason: 'Missing Model Number',
        })
        continue
      }

      if (!siteCode) {
        results.skipped.push({
          serialNo: serialNo,
          reason: 'Missing Site Code',
        })
        continue
      }

      // Check if projector already exists (by serialNo which is unique)
      const existingProjector = await prisma.projector.findFirst({
        where: { serialNo: serialNo },
      })

      if (existingProjector) {
        results.skipped.push({
          serialNo: serialNo,
          reason: 'Projector already exists',
        })
        continue
      }

      // Find site by site code
      const siteInfo = siteCodeMap.get(siteCode)
      if (!siteInfo) {
        results.errors.push({
          serialNo: serialNo,
          error: `Site not found for Site Code: ${siteCode}`,
        })
        continue
      }

      // Create projector
      const projector = await prisma.projector.create({
        data: {
          id: generateObjectId(),
          serialNo: serialNo,
          modelNo: modelNo,
          siteId: siteInfo.id,
          noOfservices: null,
          runningHours: null,
          lastServiceAt: null,
        },
      })

      results.created.push({
        serialNo: projector.serialNo,
        modelNo: projector.modelNo,
        siteCode: siteCode,
        siteName: siteInfo.siteName,
      })
    } catch (error: any) {
      console.error(`  ❌ Error at row ${i + 1}: ${error.message}`)
      results.errors.push({
        serialNo: (row as any)['Projector Serial Number'] || 'Unknown',
        error: error.message,
      })
    }
  }

  console.log('\n\n📊 Summary:')
  console.log(`  ✅ Created: ${results.created.length}`)
  console.log(`  ⏭️  Skipped: ${results.skipped.length}`)
  console.log(`  ❌ Errors: ${results.errors.length}`)

  if (results.created.length > 0) {
    console.log('\n✅ Successfully created projectors:')
    const displayCount = Math.min(results.created.length, 20)
    results.created.slice(0, displayCount).forEach((p) => {
      console.log(`  - Serial: ${p.serialNo} | Model: ${p.modelNo} | Site: ${p.siteName} (${p.siteCode})`)
    })
    if (results.created.length > displayCount) {
      console.log(`  ... and ${results.created.length - displayCount} more`)
    }
  }

  if (results.skipped.length > 0) {
    console.log('\n⏭️  Skipped:')
    const skipReasons = new Map<string, number>()
    results.skipped.forEach((s) => {
      skipReasons.set(s.reason, (skipReasons.get(s.reason) || 0) + 1)
    })
    skipReasons.forEach((count, reason) => {
      console.log(`  - ${reason}: ${count}`)
    })
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:')
    const errorCount = Math.min(results.errors.length, 10)
    results.errors.slice(0, errorCount).forEach((e) => {
      console.log(`  - Serial: ${e.serialNo} - ${e.error}`)
    })
    if (results.errors.length > errorCount) {
      console.log(`  ... and ${results.errors.length - errorCount} more errors`)
    }
  }
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

