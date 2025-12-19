# Service Report Email Functionality - Implementation Guide

## Overview
Added professional email functionality to send service reports as PDF attachments to clients, with editable email preview before sending.

## Features Implemented

### 1. **Email Preview & Editing**
- Professional default email template
- Editable subject line
- Editable email body (multiline)
- Real-time validation
- Shows PDF attachment name

### 2. **Smart Defaults**
- Auto-populates recipient email from service data (if available)
- Generates professional email content with service details
- Uses cinema name, service number, date, and model info

### 3. **Email Validation**
- Real-time email format validation
- Visual feedback for invalid emails
- Prevents sending with invalid data

### 4. **User Flow**
```
1. Click Download icon → Opens Preview Dialog
2. Enter recipient email (or use pre-filled)
3. Click "Preview Email" button
4. Review/Edit email content
   - Edit recipient, subject, body
   - See attached PDF name
5. Click "Send Email" button
6. Toast notification confirms success
```

## Files Created/Modified

### 1. **API Endpoint** (`src/app/api/admin/service-records/send-email/route.ts`)
**Purpose:** Handles email sending with PDF attachment

**Features:**
- Generates PDF using `constructAndGeneratePDF`
- Converts PDF to base64 for email attachment
- Uses Gmail OAuth transporter
- Email validation
- Error handling

**Request Body:**
```json
{
  "serviceId": "string",
  "recipientEmail": "string",
  "emailContent": {
    "subject": "string",
    "body": "string (HTML supported)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully to email@example.com"
}
```

### 2. **Enhanced Dialog Component** (`PREVIEW_DOWNLOAD_DIALOG_REPLACEMENT.tsx`)
**Purpose:** Complete replacement for PreviewDownloadDialog

**Key Features:**
- Two-step process: Preview → Email Preview
- State management for email content
- Validation logic
- Toast notifications (using sonner)
- Professional email template generator

**States:**
- `showEmailPreview`: Toggle between preview and email modes
- `email`: Recipient email address  
- `emailSubject`: Email subject line
- `emailBody`: Email message body
- `sendingEmail`: Loading state for send operation
- `emailError`: Validation error messages

### 3. **Default Email Template**
Professional template includes:
- Greeting
- Service details table (Cinema, Service#, Date, Model, Serial)
- List of report contents
- Contact information
- Professional signature

**Example:**
```
Subject: Projector Service Report - AMC Cinema - SR-2024-001

Dear Team,

Please find attached the projector service report for your facility.

Service Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cinema Name: AMC Cinema
Service Number: SR-2024-001
Service Date: December 19, 2024
Projector Model: NEC NC3200S
Serial Number: SN123456789
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The attached PDF contains a comprehensive report...
```

## Integration Steps

### Replace PreviewDownloadDialog in overview-view.tsx

**Location:** Lines 1541-1666 in `src/components/admin/overview-view.tsx`

**Steps:**
1. Copy the component from `PREVIEW_DOWNLOAD_DIALOG_REPLACEMENT.tsx`
2. Replace the existing `PreviewDownloadDialog` function
3. Add toast import if not already present:
   ```tsx
   import { toast } from "sonner"
   ```
4. Add Textarea import:
   ```tsx
   import { Textarea } from "@/components/ui/textarea"
   ```
5. Add Mail icon import (if not present):
   ```tsx
   import { Mail } from "lucide-react"
   ```

## Email Content Customization

### Modify Default Template
Edit the `generateDefaultEmailContent` function:

```typescript
const generateDefaultEmailContent = (service: any) => {
  // Customize subject
  setEmailSubject(`Your custom subject - ${service.serviceNumber}`)
  
  // Customize body
  setEmailBody(`
Your custom greeting...

Service Details:
${service.cinemaName}
...

Your custom footer...
  `)
}
```

### Email Body Formatting
- New lines: Use `\n` in the body
- Will be converted to `<br>` tags when sending
- Professional formatting with Unicode box drawing characters
- Monospace font in preview for better readability

## Usage Example

### From Admin Dashboard:
1. Navigate to Service Records
2. Click Download icon on any service record
3. Dialog opens with service preview
4. Enter or confirm recipient email
5. Click "Preview Email"
6. Review/edit subject and message
7. Click "Send Email"
8. Success toast appears
9. Email delivered with PDF attachment

## Technical Details

### PDF Attachment
- Generated on-demand during API call
- Converted to base64 for nodemailer
- Attachment filename: `Service_Report_{serviceNumber}.pdf`
- Content-Type: `application/pdf`

### Email Provider
- Uses Gmail OAuth 2.0
- Same configuration as field worker emails
- Requires env variables:
  ```
  GMAIL_OAUTH_USER
  GMAIL_OAUTH_CLIENT_ID
  GMAIL_OAUTH_CLIENT_SECRET
  GMAIL_OAUTH_REFRESH_TOKEN
  ```

### Error Handling
- Client-side email validation
- Server-side email format validation
- PDF generation error handling
- Email sending error handling
- Toast notifications for all states

## Testing

### Test the Email Functionality:
```bash
# Make sure Gmail OAuth is configured
bun run scripts/test-email.ts

# Then test from UI:
# 1. Open a service record
# 2. Click Download icon
# 3. Enter your email
# 4. Preview and send
```

### Verify Email Received:
- Check recipient inbox
- Verify PDF attachment is present
- Verify PDF opens correctly
- Check email formatting

## Benefits

1. **Professional Communication**: Well-formatted, branded emails
2. **Flexibility**: Full control over email content before sending
3. **Validation**: Prevents sending to invalid addresses
4. **User-Friendly**: Two-step process with clear visual feedback
5. **Automated**: Default content generated from service data
6. **Secure**: Uses OAuth 2.0 authentication
7. **Integrated**: Toast notifications for better UX

## Future Enhancements

Potential improvements:
- Email templates stored in database
- Multiple recipient support (CC/BCC)
- Email history/tracking
- Scheduled email sending
- Batch email functionality
- HTML email editor
- Email attachments beyond PDF

## Notes

- Emails sent from address configured in `GMAIL_OAUTH_USER`
- Gmail has daily sending limits (500/day for regular, 2000/day for Workspace)
- Email body supports HTML (converted from plain text)
- All images/styling should be inline or excluded
- PDF is attached, not embedded
