# Send Credentials Feature Implementation

## Summary
Added the ability to send login credentials to field workers via email from two places:
1. From each field worker card in the field workers list
2. After creating a new field worker (in the Add Field Worker modal)

## Changes Made

### 1. **New API Endpoint** (`src/app/api/admin/field-workers/send-credentials/route.ts`)
- Created POST endpoint to send credentials to existing field workers
- Uses Gmail OAuth to send email with login credentials
- Default password: `Ascomp123`
- Returns success/error response

### 2. **Updated Add Field Worker Modal** (`src/components/admin/modals/add-field-worker-modal.tsx`)
**New Features:**
- Modal no longer closes automatically after creating a user
- Shows success message with created user details
- Displays confirmation that credentials were sent
- Includes "Resend Credentials" button to send again if needed
- "Close" button to manually close the modal

**User Flow:**
1. Fill in name and email
2. Click "Send Invite"
3. See success message showing:
   - ✓ Field worker created successfully
   - User name and email
   - Credentials sent confirmation
4. Option to "Resend Credentials" or "Close"

### 3. **Updated Field Workers View** (`src/components/admin/field-workers-view.tsx`)
**New Features:**
- Added "Send Credentials" button to each worker card
- Button shows at the bottom of each card
- Loading state while sending ("Sending...")
- Success/error alerts after sending
- Prevents card navigation click when clicking the button

**User Flow:**
1. Click "Send Credentials" on any worker card
2. Button shows "Sending..." state
3. Email is sent to the worker
4. Alert confirms success or shows error

## Email Content

Both features send the same email template:
- Subject: "Ascomp CRM - Your Login Credentials"
- Contains:
  - Greeting with user's name
  - Email address
  - Password (Ascomp123)
  - Login link
  - Security reminder to change password

## Usage

### Send Credentials from Worker Card:
```tsx
// Simply click the "Send Credentials" button on any worker card
// The button is at the bottom of each card in the field workers list
```

### Send Credentials After Creating Worker:
```tsx
// 1. Click "Add Field Worker"
// 2. Fill in name and email
// 3. Click "Send Invite"
// 4. See success message
// 5. Click "Resend Credentials" if needed
// 6. Click "Close" when done
```

## Benefits

1. **Flexibility**: Can resend credentials anytime without recreating the user
2. **User-Friendly**: Clear success/error messages
3. **No Accidental Closes**: Modal stays open until user explicitly closes it
4. **Confirmation**: Visual feedback that emails were sent
5. **Error Handling**: Clear error messages if email fails

## Testing

Test the email system:
```bash
bun run scripts/test-email.ts
```

## Notes

- All emails are sent from the configured Gmail account (`GMAIL_OAUTH_USER`)
- Default password is always `Ascomp123` (users should change it after first login)
- Emails are sent during user creation AND can be resent anytime
- Button prevents navigation click propagation to avoid accidental redirects
