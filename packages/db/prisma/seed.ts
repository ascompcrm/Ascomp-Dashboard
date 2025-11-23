import dotenv from 'dotenv'
import { PrismaClient, Role, ServiceStatus } from './generated/client'
import path from 'path'
import { fileURLToPath } from 'url'
import { auth } from '@my-better-t-app/auth'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({
  path: path.resolve(__dirname, '../../../apps/web/.env'),
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
  
  const adminData = await adminResponse.json()
  
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
  const fieldWorkers = [
    { name: 'John Doe', email: 'john.doe@crm.com' },
    { name: 'Jane Smith', email: 'jane.smith@crm.com' },
    { name: 'Mike Johnson', email: 'mike.johnson@crm.com' },
    { name: 'Sarah Williams', email: 'sarah.williams@crm.com' },
    { name: 'David Brown', email: 'david.brown@crm.com' },
  ]

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
      
      const signUpData = await signUpResponse.json()

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
  const projectors = []

  for (let i = 0; i < sites.length; i++) {
    const site = sites[i]
    const projectorsPerSite = Math.floor(Math.random() * 3) + 2 // 2-4 projectors per site

    for (let j = 0; j < projectorsPerSite; j++) {
      const model = projectorModels[Math.floor(Math.random() * projectorModels.length)]
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
          noOfservices: Math.floor(Math.random() * 5) + 1,
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

  for (const projector of projectors) {
    // Create completed service records (older than 6 months - these should be "completed")
    const oldServiceDate = monthsAgo(8) // 8 months ago
    const service1 = await prisma.serviceRecord.create({
      data: {
        id: generateObjectId(),
        userId: admin.id,
        projectorId: projector.id,
        siteId: projector.siteId,
        serviceNumber: 1,
        status: ServiceStatus.COMPLETED,
        date: oldServiceDate,
        cinemaName: (await prisma.site.findUnique({ where: { id: projector.siteId } }))?.siteName || '',
        projectorRunningHours: Math.floor(Math.random() * 2000) + 500,
        createdAt: oldServiceDate,
        updatedAt: oldServiceDate,
      },
    })
    serviceRecordCount++

    // Create a more recent completed service (within 6 months - still "completed")
    const recentServiceDate = monthsAgo(3) // 3 months ago
    const service2 = await prisma.serviceRecord.create({
      data: {
        id: generateObjectId(),
        userId: admin.id,
        projectorId: projector.id,
        siteId: projector.siteId,
        serviceNumber: 2,
        status: ServiceStatus.COMPLETED,
        date: recentServiceDate,
        cinemaName: (await prisma.site.findUnique({ where: { id: projector.siteId } }))?.siteName || '',
        projectorRunningHours: Math.floor(Math.random() * 2000) + 500,
        createdAt: recentServiceDate,
        updatedAt: recentServiceDate,
      },
    })
    serviceRecordCount++

    // For some projectors, create pending/scheduled services
    if (Math.random() > 0.5) {
      // Check if nextServiceAt has passed
      const site = await prisma.site.findUnique({ where: { id: projector.siteId } })
      if (projector.nextServiceAt && projector.nextServiceAt < new Date()) {
        // Create PENDING service (admin needs to schedule)
        const pendingService = await prisma.serviceRecord.create({
          data: {
            id: generateObjectId(),
            userId: admin.id,
            projectorId: projector.id,
            siteId: projector.siteId,
            serviceNumber: 3,
            status: ServiceStatus.PENDING,
            cinemaName: site?.siteName || '',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        serviceRecordCount++

        // For some, create SCHEDULED service (assigned to field worker)
        if (Math.random() > 0.5) {
          const randomWorker = createdFieldWorkers[Math.floor(Math.random() * createdFieldWorkers.length)]
          const scheduledService = await prisma.serviceRecord.create({
            data: {
              id: generateObjectId(),
              userId: admin.id,
              assignedToId: randomWorker.id,
              projectorId: projector.id,
              siteId: projector.siteId,
              serviceNumber: 4,
              status: ServiceStatus.SCHEDULED,
              date: monthsFromNow(Math.floor(Math.random() * 2)), // Scheduled for next 0-2 months
              cinemaName: site?.siteName || '',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
          serviceRecordCount++
        }
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

