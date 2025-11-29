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

// Set to true to clear existing sites before adding new ones
const RESET_DATABASE = false

async function main() {
  console.log('🚀 Starting sites import from Excel...\n')

  const excelPath = path.resolve(__dirname, 'UniqueSites.xlsx')

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel file not found at: ${excelPath}`)
    process.exit(1)
  }

  // Reset database if requested
  if (RESET_DATABASE) {
    console.log('🗑️  Resetting database (clearing existing sites)...')
    await prisma.serviceRecord.deleteMany({})
    await prisma.projector.deleteMany({})
    await prisma.site.deleteMany({})
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

  const results = {
    created: [] as Array<{ siteName: string; siteCode: string | null; state: string | null; region: string | null }>,
    skipped: [] as Array<{ siteName: string; reason: string }>,
    errors: [] as Array<{ siteName: string; error: string }>,
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as any
    try {
      // Get data from Excel columns
      const siteName = cleanString(row['Site Name'])
      const state = cleanString(row['State'])
      const region = cleanString(row['Region'])
      const siteCode = cleanString(row['Site Code'])

      console.log(`\n📝 Processing row ${i + 1}/${rows.length}: ${siteName || 'Unknown'}`)

      if (!siteName) {
        console.log(`  ⚠️  Skipping: Missing Site Name`)
        results.skipped.push({
          siteName: 'Unknown',
          reason: 'Missing Site Name',
        })
        continue
      }

      // Check if site already exists (by siteCode if available, otherwise by siteName)
      let existingSite = null
      if (siteCode) {
        existingSite = await prisma.site.findFirst({
          where: { siteCode: siteCode },
        })
      }
      
      if (!existingSite) {
        existingSite = await prisma.site.findFirst({
          where: { siteName: siteName },
        })
      }

      if (existingSite) {
        console.log(`  ⚠️  Site already exists, skipping...`)
        console.log(`     Existing: ${existingSite.siteName} (${existingSite.siteCode || 'no code'})`)
        results.skipped.push({
          siteName: siteName,
          reason: 'Site already exists',
        })
        continue
      }

      // Create site
      // Note: address and contactDetails are required in schema but not in Excel
      // Using empty strings for now - these can be updated later
      const site = await prisma.site.create({
        data: {
          id: generateObjectId(),
          siteName: siteName,
          address: '', // Empty string - needs to be updated later
          contactDetails: '', // Empty string - needs to be updated later
          state: state || null,
          region: region || null,
          siteCode: siteCode || null,
          screenNo: null, // Optional
        },
      })

      console.log(`  ✅ Created successfully!`)
      console.log(`     ID: ${site.id}`)
      console.log(`     Site Name: ${site.siteName}`)
      console.log(`     Site Code: ${site.siteCode || 'N/A'}`)
      console.log(`     State: ${site.state || 'N/A'}`)
      console.log(`     Region: ${site.region || 'N/A'}`)

      results.created.push({
        siteName: site.siteName,
        siteCode: site.siteCode,
        state: site.state,
        region: site.region,
      })
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`)
      results.errors.push({
        siteName: (row as any)['Site Name'] || 'Unknown',
        error: error.message,
      })
    }
  }

  console.log('\n\n📊 Summary:')
  console.log(`  ✅ Created: ${results.created.length}`)
  console.log(`  ⏭️  Skipped: ${results.skipped.length}`)
  console.log(`  ❌ Errors: ${results.errors.length}`)

  if (results.created.length > 0) {
    console.log('\n✅ Successfully created sites:')
    results.created.forEach((s) => {
      console.log(`  - ${s.siteName} (Code: ${s.siteCode || 'N/A'}, State: ${s.state || 'N/A'}, Region: ${s.region || 'N/A'})`)
    })
  }

  if (results.skipped.length > 0) {
    console.log('\n⏭️  Skipped (already exist):')
    results.skipped.forEach((s) => {
      console.log(`  - ${s.siteName}: ${s.reason}`)
    })
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:')
    results.errors.forEach((s) => {
      console.log(`  - ${s.siteName}: ${s.error}`)
    })
  }

  console.log(`\n⚠️  Note: Sites were created with empty strings for 'address' and 'contactDetails'`)
  console.log(`   These are required fields in the schema but were not in the Excel file.`)
  console.log(`   Please update these fields manually or add them to the Excel file.`)
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

