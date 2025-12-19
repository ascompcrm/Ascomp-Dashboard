import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Default password (same as in create route)
        const password = "Ascomp123"
        const origin = request.headers.get("origin") || process.env.CORS_ORIGIN || "http://localhost:3000"

        // Send email with login credentials using Gmail OAuth
        try {
            await sendEmail({
                to: user.email,
                subject: "Ascomp CRM - Your Login Credentials",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your Ascomp CRM Login Credentials</h2>
            <p>Hello ${user.name},</p>
            <p>Here are your login credentials for the Ascomp CRM system:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
            </div>
            <p>Please log in at: <a href="${origin}/login">${origin}/login</a></p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">For security reasons, please change your password after logging in.</p>
          </div>
        `,
            })

            return NextResponse.json({
                success: true,
                message: `Login credentials sent successfully to ${user.email}`,
            })
        } catch (emailError) {
            console.error("Failed to send credentials email:", emailError)
            return NextResponse.json(
                { error: "Failed to send email. Please check email configuration." },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("Error sending credentials:", error)
        return NextResponse.json(
            { error: "Failed to send credentials" },
            { status: 500 }
        )
    }
}
