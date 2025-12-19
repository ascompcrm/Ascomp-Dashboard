import nodemailer from "nodemailer"

// Create Gmail OAuth2 transporter
export function createGmailTransporter() {
    if (
        !process.env.GMAIL_OAUTH_USER ||
        !process.env.GMAIL_OAUTH_CLIENT_ID ||
        !process.env.GMAIL_OAUTH_CLIENT_SECRET ||
        !process.env.GMAIL_OAUTH_REFRESH_TOKEN
    ) {
        console.warn("Gmail OAuth credentials not configured")
        return null
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.GMAIL_OAUTH_USER,
            clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
            clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
        },
    })

    return transporter
}

// Send email using Gmail OAuth2
export async function sendEmail({
    to,
    subject,
    html,
    text,
}: {
    to: string
    subject: string
    html?: string
    text?: string
}) {
    const transporter = createGmailTransporter()

    if (!transporter) {
        throw new Error("Gmail transporter not configured")
    }

    try {
        const info = await transporter.sendMail({
            from: `"Ascomp CRM" <${process.env.GMAIL_OAUTH_USER}>`,
            to,
            subject,
            text,
            html,
        })

        console.log("Email sent successfully:", info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error("Failed to send email:", error)
        throw error
    }
}
