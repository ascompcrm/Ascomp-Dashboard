# Email Service Migration: Resend → Gmail OAuth 2.0

## Summary
Successfully migrated from Resend to Gmail OAuth 2.0 for sending emails in the Ascomp CRM application.

## Changes Made

### 1. **New Email Service** (`src/lib/email.ts`)
Created a Gmail OAuth 2.0 email service using nodemailer with the following features:
- OAuth 2.0 authentication using credentials from .env
- Reusable `sendEmail()` function
- Automatic sender configuration from `GMAIL_OAUTH_USER`
- Error handling and logging

### 2. **Updated Field Worker Creation** (`src/app/api/admin/field-workers/create/route.ts`)
- Replaced Resend import with Gmail email service
- Updated email sending logic to use `sendEmail()` function
- Maintained the same email template and functionality

### 3. **Dependencies**
- ✅ Added: `nodemailer` and `@types/nodemailer`
- ❌ Removed: `resend` package

### 4. **Test Script** (`scripts/test-email.ts`)
Created a test script to verify Gmail OAuth configuration.

## Required Environment Variables

Make sure these are configured in your `.env` file:

```env
GMAIL_OAUTH_USER=your-email@gmail.com
GMAIL_OAUTH_CLIENT_ID=your-client-id
GMAIL_OAUTH_CLIENT_SECRET=your-client-secret
GMAIL_OAUTH_REFRESH_TOKEN=your-refresh-token
```

## Testing

Run the test script to verify your Gmail OAuth setup:

```bash
bun run scripts/test-email.ts
```

This will send a test email to the configured GMAIL_OAUTH_USER address.

## Usage Example

To send an email from anywhere in the codebase:

```typescript
import { sendEmail } from "@/lib/email"

await sendEmail({
  to: "recipient@example.com",
  subject: "Your Subject",
  html: "<h1>HTML content</h1>",
  text: "Plain text version" // optional
})
```

## What Works Now

1. ✅ Field worker creation sends welcome emails via Gmail
2. ✅ Emails sent from your configured Gmail account
3. ✅ OAuth 2.0 authentication (more secure than API keys)
4. ✅ No dependency on external email services (Resend)

## Notes

- All emails will be sent from the Gmail account configured in `GMAIL_OAUTH_USER`
- Make sure your Gmail OAuth credentials are valid and have not expired
- The refresh token should automatically refresh access tokens as needed
- Gmail has sending limits (typically 500/day for regular accounts, 2000/day for Google Workspace)
