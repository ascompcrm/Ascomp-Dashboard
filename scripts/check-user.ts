import prisma from "@/lib/db"

async function checkUser() {
    const email = "support.north@ascompinc.in"

    try {
        // Find the user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                accounts: true,
            },
        })

        if (!user) {
            console.error(`❌ User not found: ${email}`)
            return
        }

        console.log(`\n=== User Info ===`)
        console.log(`ID: ${user.id}`)
        console.log(`Name: ${user.name}`)
        console.log(`Email: ${user.email}`)
        console.log(`Role: ${user.role}`)
        console.log(`Password in User table: ${user.password ? "EXISTS" : "NULL"}`)

        console.log(`\n=== Accounts ===`)
        console.log(`Number of accounts: ${user.accounts.length}`)
        user.accounts.forEach((account, index) => {
            console.log(`\nAccount ${index + 1}:`)
            console.log(`  ID: ${account.id}`)
            console.log(`  Provider ID: ${account.providerId}`)
            console.log(`  Account ID: ${account.accountId}`)
            console.log(`  Password: ${account.password ? "EXISTS" : "NULL"}`)
        })

    } catch (error) {
        console.error("❌ Error:", error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUser()
