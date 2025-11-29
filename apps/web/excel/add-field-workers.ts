import dotenv from 'dotenv'
import { PrismaClient, Role } from '@prisma/client'
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

// Admin user to add
const ADMIN_USER = {
  name: 'Ascomp',
  email: 'info@ascompinc.com',
  password: 'Ascomp@admin',
  role: Role.ADMIN,
}

// Field workers to add
const FIELD_WORKERS = [
  {
    name: 'Manoj kumar',
    email: 'support.ncr@ascompinc.in',
    phone: '9953826790',
  },
  {
    name: 'Challa China',
    email: 'support.north@ascompinc.in',
    phone: '7680939321',
  },
  {
    name: 'Arun Rajkumar',
    email: 'support.east@ascompinc.in',
    phone: '8056033181',
  },
  {
    name: 'Satish Yadav',
    email: 'support.south@ascompinc.in',
    phone: '9594419014',
  },
]

// Password for all field workers (same for all as requested)
// You can change this to your desired password
const PASSWORD = 'Ascomp123'

// Set to true to clear existing users before adding new ones
const RESET_DATABASE = false

async function main() {
  console.log('🚀 Starting user addition (Admin + Field Workers)...')
  console.log(`📝 Field worker password: ${PASSWORD} (same for all field workers)\n`)

  // Reset database if requested
  if (RESET_DATABASE) {
    console.log('🗑️  Resetting database (clearing existing users)...')
    await prisma.serviceRecord.deleteMany({})
    await prisma.account.deleteMany({})
    await prisma.session.deleteMany({})
    await prisma.user.deleteMany({})
    console.log('✅ Database cleared\n')
  }

  const results = {
    created: [] as Array<{ name: string; email: string; phone?: string; role: string }>,
    skipped: [] as Array<{ name: string; email: string; reason: string }>,
    errors: [] as Array<{ name: string; email: string; error: string }>,
  }

  // Create Admin User first
  console.log('\n👑 Creating Admin User...')
  try {
    console.log(`👤 Processing: ${ADMIN_USER.name} (${ADMIN_USER.email})`)

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_USER.email },
    })

    if (existingAdmin) {
      console.log(`  ⚠️  Admin already exists, skipping...`)
      results.skipped.push({
        name: ADMIN_USER.name,
        email: ADMIN_USER.email,
        reason: 'Admin already exists',
      })
    } else {
      // Create admin using better-auth API
      const adminSignUpRequest = new Request('http://localhost/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_USER.email,
          password: ADMIN_USER.password,
          name: ADMIN_USER.name,
          role: 'ADMIN',
        }),
      })

      const adminSignUpResponse = await auth.handler(adminSignUpRequest)

      if (!adminSignUpResponse.ok) {
        const errorText = await adminSignUpResponse.text()
        throw new Error(`Sign-up failed: ${adminSignUpResponse.status} ${errorText}`)
      }

      const adminSignUpData: any = await adminSignUpResponse.json()

      if (!adminSignUpData || !adminSignUpData.user) {
        throw new Error(`Invalid response: ${JSON.stringify(adminSignUpData)}`)
      }

      // Ensure role is set to ADMIN
      const admin = await prisma.user.update({
        where: { id: adminSignUpData.user.id },
        data: { 
          role: Role.ADMIN,
        },
      })

      console.log(`  ✅ Admin created successfully!`)
      console.log(`     ID: ${admin.id}`)
      console.log(`     Email: ${admin.email}`)
      console.log(`     Role: ${admin.role}`)

      results.created.push({
        name: ADMIN_USER.name,
        email: ADMIN_USER.email,
        role: 'ADMIN',
      })
    }
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`)
    results.errors.push({
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      error: error.message,
    })
  }

  // Create Field Workers
  console.log('\n👷 Creating Field Workers...')
  for (const worker of FIELD_WORKERS) {
    try {
      console.log(`\n👤 Processing: ${worker.name} (${worker.email})`)

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: worker.email },
      })

      if (existingUser) {
        console.log(`  ⚠️  User already exists, skipping...`)
        results.skipped.push({
          name: worker.name,
          email: worker.email,
          reason: 'User already exists',
        })
        continue
      }

      // Create user using better-auth API
      const signUpRequest = new Request('http://localhost/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: worker.email,
          password: PASSWORD,
          name: worker.name,
          role: 'FIELD_WORKER',
        }),
      })

      const signUpResponse = await auth.handler(signUpRequest)

      if (!signUpResponse.ok) {
        const errorText = await signUpResponse.text()
        throw new Error(`Sign-up failed: ${signUpResponse.status} ${errorText}`)
      }

      const signUpData: any = await signUpResponse.json()

      if (!signUpData || !signUpData.user) {
        throw new Error(`Invalid response: ${JSON.stringify(signUpData)}`)
      }

      // Ensure role is set to FIELD_WORKER and save phone number
      const user = await prisma.user.update({
        where: { id: signUpData.user.id },
        data: { 
          role: Role.FIELD_WORKER,
          phoneNumber: worker.phone,
        },
      })

      console.log(`  ✅ Created successfully!`)
      console.log(`     ID: ${user.id}`)
      console.log(`     Email: ${user.email}`)
      console.log(`     Phone: ${user.phoneNumber}`)

      results.created.push({
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        role: 'FIELD_WORKER',
      })
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`)
      results.errors.push({
        name: worker.name,
        email: worker.email,
        error: error.message,
      })
    }
  }

  console.log('\n\n📊 Summary:')
  console.log(`  ✅ Created: ${results.created.length}`)
  console.log(`  ⏭️  Skipped: ${results.skipped.length}`)
  console.log(`  ❌ Errors: ${results.errors.length}`)

  if (results.created.length > 0) {
    console.log('\n✅ Successfully created users:')
    results.created.forEach((w) => {
      const phoneInfo = w.phone ? ` - Phone: ${w.phone}` : ''
      console.log(`  - ${w.name} (${w.email}) - Role: ${w.role}${phoneInfo}`)
    })
  }

  if (results.skipped.length > 0) {
    console.log('\n⏭️  Skipped (already exist):')
    results.skipped.forEach((w) => {
      console.log(`  - ${w.name} (${w.email})`)
    })
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:')
    results.errors.forEach((w) => {
      console.log(`  - ${w.name} (${w.email}): ${w.error}`)
    })
  }

  console.log(`\n🔑 Passwords:`)
  console.log(`  - Admin: ${ADMIN_USER.password}`)
  console.log(`  - Field Workers: ${PASSWORD} (same for all)`)
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

