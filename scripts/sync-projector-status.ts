/**
 * Database Sync Script
 * 
 * This script:
 * 1. Goes through all projectors
 * 2. Finds the latest service record date for each projector
 * 3. Updates `lastServiceAt` with that date
 * 4. Updates `status` based on whether last service was within 6 months (COMPLETED) or not (PENDING)
 * 
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/sync-projector-status.ts
 * Or: bun run scripts/sync-projector-status.ts
 */

import { PrismaClient, ServiceStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function syncProjectorStatus() {
    console.log('🔄 Starting projector status sync...\n')

    const now = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    console.log(`📅 Current date: ${now.toISOString().split('T')[0]}`)
    console.log(`📅 6 months ago: ${sixMonthsAgo.toISOString().split('T')[0]}\n`)

    // Get all projectors with their service records
    const projectors = await prisma.projector.findMany({
        include: {
            serviceRecords: {
                orderBy: { date: 'desc' },
                take: 1, // Only get the latest
                select: { date: true, id: true }
            },
            site: { select: { siteName: true } }
        }
    })

    console.log(`📊 Found ${projectors.length} projectors to process\n`)
    console.log('─'.repeat(80))

    let updatedCount = 0
    let pendingCount = 0
    let completedCount = 0

    for (const projector of projectors) {
        const latestServiceRecord = projector.serviceRecords[0]
        const latestServiceDate = latestServiceRecord?.date || null

        // Determine status based on last service date
        let newStatus: ServiceStatus

        if (!latestServiceDate) {
            // No service record found - PENDING
            newStatus = ServiceStatus.PENDING
            pendingCount++
        } else if (latestServiceDate < sixMonthsAgo) {
            // Last service was more than 6 months ago - PENDING
            newStatus = ServiceStatus.PENDING
            pendingCount++
        } else {
            // Last service was within 6 months - COMPLETED
            newStatus = ServiceStatus.COMPLETED
            completedCount++
        }

        // Check if update is needed
        const needsUpdate =
            projector.lastServiceAt?.getTime() !== latestServiceDate?.getTime() ||
            projector.status !== newStatus

        if (needsUpdate) {
            await prisma.projector.update({
                where: { id: projector.id },
                data: {
                    lastServiceAt: latestServiceDate,
                    status: newStatus
                }
            })
            updatedCount++

            console.log(`✅ Updated: ${projector.serialNo}`)
            console.log(`   Site: ${projector.site?.siteName || 'Unknown'}`)
            console.log(`   Model: ${projector.modelNo}`)
            console.log(`   Old Status: ${projector.status} → New Status: ${newStatus}`)
            console.log(`   Last Service: ${latestServiceDate ? latestServiceDate.toISOString().split('T')[0] : 'Never'}`)
            console.log(`   Old lastServiceAt: ${projector.lastServiceAt?.toISOString().split('T')[0] || 'null'}`)
            console.log('')
        } else {
            console.log(`⏭️  Skipped (no changes): ${projector.serialNo} - ${newStatus}`)
        }
    }

    console.log('─'.repeat(80))
    console.log('\n📈 Sync Summary:')
    console.log(`   Total Projectors: ${projectors.length}`)
    console.log(`   Updated: ${updatedCount}`)
    console.log(`   Skipped (no changes): ${projectors.length - updatedCount}`)
    console.log(`   Status - COMPLETED: ${completedCount}`)
    console.log(`   Status - PENDING: ${pendingCount}`)
    console.log('\n✨ Sync completed successfully!')
}

// Run the script
syncProjectorStatus()
    .catch((error) => {
        console.error('❌ Error during sync:', error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
