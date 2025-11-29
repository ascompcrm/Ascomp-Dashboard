import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Deleting all projectors...')
  const count = await prisma.projector.deleteMany({})
  console.log(`✅ Deleted ${count.count} projectors`)
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

