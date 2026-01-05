/**
 * Script to clean up corrupted status fields in ServiceRecord table
 * 
 * Problem: Some status fields contain note-like patterns, e.g.:
 *   "Concern - Red colour coming on screen"
 *   "YES (Needs Replacement) - Chipped"
 * 
 * These should be cleaned to just the status part:
 *   "Concern"
 *   "YES (Needs Replacement)"
 * 
 * Usage:
 *   DRY RUN (safe, just logs what would be changed):
 *     npx tsx prisma/cleanup-status-fields.ts
 * 
 *   EXECUTE (actually updates the database):
 *     npx tsx prisma/cleanup-status-fields.ts --execute
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Check if we should execute or just dry run
const DRY_RUN = !process.argv.includes('--execute')

// Status fields that should NEVER contain note-like patterns
const STATUS_FIELDS = [
    'reflector', 'uvFilter', 'integratorRod', 'coldMirror', 'foldMirror',
    'touchPanel', 'evbBoard', 'ImcbBoard', 'pibBoard', 'IcpBoard', 'imbSBoard',
    'serialNumberVerified', 'AirIntakeLadRad', 'coolantLevelColor',
    'lightEngineWhite', 'lightEngineRed', 'lightEngineGreen', 'lightEngineBlue', 'lightEngineBlack',
    'acBlowerVane', 'extractorVane', 'lightEngineFans', 'cardCageFans',
    'radiatorFanPump', 'pumpConnectorHose', 'securityLampHouseLock', 'lampLocMechanism',
    'focusBoresight', 'integratorPosition', 'spotsOnScreen',
    'screenCropping', 'convergence', 'channelsChecked',
    'pixelDefects', 'imageVibration', 'liteloc', 'leStatus', 'acStatus'
] as const

// Known valid status values (the part before any " - ")
const VALID_STATUS_PREFIXES = [
    'OK', 'YES', 'Concern', 'Working', 'Not Working', 'Not Available',
    'Removed', 'Not removed', 'OK (Part is Ok)', 'YES (Needs Replacement)',
    'true', 'false' // Some fields might have boolean strings
]

// Sanitize status field value - removes any note-like patterns
function sanitizeStatusValue(value: string | null): { cleaned: string | null; wasChanged: boolean } {
    if (!value || typeof value !== 'string') {
        return { cleaned: value, wasChanged: false }
    }

    // Check if the value contains " - " which indicates note was incorrectly appended
    const separatorIndex = value.indexOf(' - ')
    if (separatorIndex === -1) {
        return { cleaned: value, wasChanged: false } // No separator, value is clean
    }

    // Extract the part before " - "
    const statusPart = value.substring(0, separatorIndex).trim()

    // Check if the extracted part looks like a valid status
    const isValidStatus = VALID_STATUS_PREFIXES.some(prefix =>
        statusPart === prefix || statusPart.startsWith(prefix)
    )

    if (isValidStatus) {
        // Return just the status part, removing the note
        return { cleaned: statusPart, wasChanged: true }
    }

    // If we can't identify a valid status prefix, don't change it
    return { cleaned: value, wasChanged: false }
}

interface FieldChange {
    field: string
    originalValue: string
    cleanedValue: string
}

interface RecordToUpdate {
    id: string
    serviceNumber: string | null
    cinemaName: string | null
    changes: FieldChange[]
}

async function main() {
    console.log('\n' + '='.repeat(70))
    console.log('🧹 SERVICE RECORD STATUS FIELD CLEANUP SCRIPT')
    console.log('='.repeat(70))

    if (DRY_RUN) {
        console.log('\n⚠️  DRY RUN MODE - No changes will be made to the database')
        console.log('   To execute changes, run with: npx tsx prisma/cleanup-status-fields.ts --execute\n')
    } else {
        console.log('\n🚨 EXECUTE MODE - Changes WILL be made to the database!')
        console.log('   Make sure you have reviewed the dry run output first!\n')
    }

    // Fetch all service records
    console.log('📊 Fetching all service records...')
    const records = await prisma.serviceRecord.findMany({
        select: {
            id: true,
            serviceNumber: true,
            cinemaName: true,
            // Select all status fields
            reflector: true,
            uvFilter: true,
            integratorRod: true,
            coldMirror: true,
            foldMirror: true,
            touchPanel: true,
            evbBoard: true,
            ImcbBoard: true,
            pibBoard: true,
            IcpBoard: true,
            imbSBoard: true,
            serialNumberVerified: true,
            AirIntakeLadRad: true,
            coolantLevelColor: true,
            lightEngineWhite: true,
            lightEngineRed: true,
            lightEngineGreen: true,
            lightEngineBlue: true,
            lightEngineBlack: true,
            acBlowerVane: true,
            extractorVane: true,
            lightEngineFans: true,
            cardCageFans: true,
            radiatorFanPump: true,
            pumpConnectorHose: true,
            securityLampHouseLock: true,
            lampLocMechanism: true,
            focusBoresight: true,
            integratorPosition: true,
            spotsOnScreen: true,
            screenCropping: true,
            convergence: true,
            channelsChecked: true,
            pixelDefects: true,
            imageVibration: true,
            liteloc: true,
            leStatus: true,
            acStatus: true,
        }
    })

    console.log(`   Found ${records.length} service records\n`)

    // Analyze each record for corrupted fields
    const recordsToUpdate: RecordToUpdate[] = []
    let totalCorruptedFields = 0

    for (const record of records) {
        const changes: FieldChange[] = []

        for (const field of STATUS_FIELDS) {
            const value = (record as any)[field] as string | null
            const { cleaned, wasChanged } = sanitizeStatusValue(value)

            if (wasChanged && value && cleaned) {
                changes.push({
                    field,
                    originalValue: value,
                    cleanedValue: cleaned
                })
            }
        }

        if (changes.length > 0) {
            recordsToUpdate.push({
                id: record.id,
                serviceNumber: record.serviceNumber,
                cinemaName: record.cinemaName,
                changes
            })
            totalCorruptedFields += changes.length
        }
    }

    // Print summary
    console.log('📋 ANALYSIS RESULTS')
    console.log('-'.repeat(70))
    console.log(`   Total records analyzed: ${records.length}`)
    console.log(`   Records with corrupted fields: ${recordsToUpdate.length}`)
    console.log(`   Total corrupted fields: ${totalCorruptedFields}`)
    console.log('')

    if (recordsToUpdate.length === 0) {
        console.log('✅ No corrupted status fields found! Database is clean.')
        await prisma.$disconnect()
        return
    }

    // Print detailed changes
    console.log('📝 DETAILED CHANGES')
    console.log('-'.repeat(70))

    for (const record of recordsToUpdate) {
        console.log(`\n🔹 Record: ${record.id}`)
        console.log(`   Service Number: ${record.serviceNumber || 'N/A'}`)
        console.log(`   Cinema: ${record.cinemaName || 'N/A'}`)
        console.log(`   Fields to clean (${record.changes.length}):`)

        for (const change of record.changes) {
            console.log(`     • ${change.field}:`)
            console.log(`       BEFORE: "${change.originalValue}"`)
            console.log(`       AFTER:  "${change.cleanedValue}"`)
        }
    }

    console.log('\n' + '-'.repeat(70))

    // Execute updates if not dry run
    if (!DRY_RUN) {
        console.log('\n🚀 EXECUTING UPDATES...\n')

        let successCount = 0
        let errorCount = 0

        for (const record of recordsToUpdate) {
            try {
                const updateData: Record<string, string> = {}
                for (const change of record.changes) {
                    updateData[change.field] = change.cleanedValue
                }

                await prisma.serviceRecord.update({
                    where: { id: record.id },
                    data: updateData
                })

                console.log(`   ✅ Updated record ${record.id} (${record.changes.length} fields)`)
                successCount++
            } catch (error) {
                console.error(`   ❌ Failed to update record ${record.id}:`, error)
                errorCount++
            }
        }

        console.log('\n' + '='.repeat(70))
        console.log('📊 EXECUTION SUMMARY')
        console.log('='.repeat(70))
        console.log(`   Records updated successfully: ${successCount}`)
        console.log(`   Records failed: ${errorCount}`)
        console.log(`   Total fields cleaned: ${totalCorruptedFields}`)

        if (errorCount === 0) {
            console.log('\n✅ All records cleaned successfully!')
        } else {
            console.log('\n⚠️  Some records failed to update. Check the errors above.')
        }
    } else {
        console.log('\n💡 To apply these changes, run:')
        console.log('   npx tsx prisma/cleanup-status-fields.ts --execute')
    }

    console.log('\n' + '='.repeat(70) + '\n')

    await prisma.$disconnect()
}

main()
    .catch((error) => {
        console.error('❌ Script failed with error:', error)
        prisma.$disconnect()
        process.exit(1)
    })
