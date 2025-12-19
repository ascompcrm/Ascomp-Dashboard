// Load environment variables from .env file
import "dotenv/config"
import { sendEmail } from "@/lib/email"

async function testEmail() {
    const testRecipient = process.env.GMAIL_OAUTH_USER // Send to yourself for testing

    if (!testRecipient) {
        console.error("❌ GMAIL_OAUTH_USER not configured in .env")
        return
    }

    console.log(`\n📧 Testing Gmail OAuth Email Service`)
    console.log(`Sending test email to: ${testRecipient}\n`)

    try {
        await sendEmail({
            to: testRecipient,
            subject: "Test Email - Ascomp CRM",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">✅ Gmail OAuth 2.0 Email Service is Working!</h2>
          <p>This is a test email from your Ascomp CRM application.</p>
          <p>If you received this email, your Gmail OAuth configuration is working correctly.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            <strong>Configuration Details:</strong><br>
            • Service: Gmail OAuth 2.0<br>
            • From: ${process.env.GMAIL_OAUTH_USER}<br>
            • Transport: Nodemailer
          </p>
        </div>
      `,
            text: "Gmail OAuth 2.0 Email Service is Working! This is a test email from your Ascomp CRM application.",
        })

        console.log("✅ Test email sent successfully!")
        console.log(`Check your inbox at: ${testRecipient}\n`)
    } catch (error) {
        console.error("❌ Failed to send test email:")
        console.error(error)
        console.log("\nPlease verify your Gmail OAuth credentials in .env:")
        console.log("- GMAIL_OAUTH_USER")
        console.log("- GMAIL_OAUTH_CLIENT_ID")
        console.log("- GMAIL_OAUTH_CLIENT_SECRET")
        console.log("- GMAIL_OAUTH_REFRESH_TOKEN\n")
    }
}

testEmail()
