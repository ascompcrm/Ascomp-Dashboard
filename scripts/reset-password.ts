import prisma from "@/lib/db"

async function resetPassword() {
    const email = "support.north@ascompinc.in"
    const newPassword = "Ascomp123"

    try {
        // Find the user with their accounts
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                accounts: {
                    where: {
                        providerId: "credential" // Email/password authentication
                    }
                }
            },
        })

        if (!user) {
            console.error(`❌ User not found: ${email}`)
            return
        }

        if (user.accounts.length === 0) {
            console.error(`❌ No credential account found for user: ${email}`)
            return
        }

        console.log(`Found user: ${user.name} (${user.email})`)
        console.log(`Found ${user.accounts.length} credential account(s)`)

        // Import better-auth's hashPassword function
        const { hashPassword } = await import("better-auth/crypto")

        // Hash the new password using better-auth's method
        const hashedPassword = await hashPassword(newPassword)

        // Update the password in the Account table (where better-auth stores it)
        const account = user.accounts[0]
        if (!account) {
            console.error(`❌ No account found for user: ${email}`)
            return
        }

        await prisma.account.update({
            where: { id: account.id },
            data: {
                password: hashedPassword,
            },
        })

        console.log(`✅ Password successfully reset in Account table`)
        console.log(`New password: ${newPassword}`)
        console.log(`\nYou can now login with:`)
        console.log(`Email: ${email}`)
        console.log(`Password: ${newPassword}`)

    } catch (error) {
        console.error("❌ Error resetting password:", error)
    } finally {
        await prisma.$disconnect()
    }
}

resetPassword()
