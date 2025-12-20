# Service Assignment Email Notification

## Overview
Implemented automatic email notifications that are sent to field workers when a service is assigned to them.

## What Was Changed

### File Modified: `src/app/api/admin/services/schedule/route.ts`

1. **Added Email Import**
   - Imported the `sendEmail` function from `@/lib/email`

2. **Enhanced Field Worker Query**
   - Updated the field worker query to fetch `email` and `name` in addition to `id`
   - Added validation to ensure the field worker has an email address

3. **Enhanced Projector Query**
   - Updated projector query to select `serialNo` and `modelNo` for use in the email

4. **Email Notification Functionality**
   - After successfully scheduling a service and updating projector status, an email is automatically sent
   - Email is sent via OAuth 2.0 using the existing `sendEmail` function
   - If the email fails to send, the error is logged but doesn't block the scheduling operation

## Email Features

### Professional HTML Email Template
The email includes:

1. **Attractive Header**
   - Gradient background (purple theme)
   - Clear "New Service Assignment" title

2. **Site Information Card** (Blue-accented)
   - Site name
   - Full address
   - Contact details (if available)

3. **Projector Information Card** (Purple-accented)
   - Projector model
   - Serial number (displayed in monospace font)

4. **Schedule Information Card** (Green-accented)
   - Beautifully formatted date (e.g., "Friday, December 20, 2024")

5. **Call-to-Action Button**
   - Gradient button linking to the dashboard login page
   - Encourages field worker to view details in the system

6. **Important Note**
   - Yellow warning box reminding the field worker to confirm details before the scheduled date

7. **Professional Footer**
   - Automated notification disclaimer
   - Copyright notice with current year

### Email Design Principles
- **Clean and Modern**: Uses modern web fonts and clean spacing
- **Mobile-Responsive**: Inline styles ensure proper rendering across email clients
- **Color-Coded Sections**: Different accent colors for different information types
- **Professional Branding**: Consistent with Ascomp CRM branding
- **Easy to Read**: Clear hierarchy and well-structured information

## Technical Details

### Email Sending Method
- Uses Gmail OAuth 2.0 via nodemailer (already configured in your system)
- Non-blocking: Email failures won't prevent service scheduling
- Comprehensive error logging for debugging

### Data Flow
1. Admin schedules a service via the UI
2. API validates all required data (site, projector, field worker)
3. Service record is created/updated in the database
4. Projector status is updated to SCHEDULED
5. Email notification is sent to the field worker
6. Success response is returned to the admin

### Error Handling
- Email failures are caught and logged
- Service scheduling succeeds even if email fails
- All errors are logged to console for monitoring

## Testing

To test the email functionality:
1. Go to Sites & Projectors in the admin dashboard
2. Expand a site and click "Schedule" on a projector
3. Select a field worker and scheduled date
4. Click "Schedule"
5. The field worker should receive an email at their registered email address

## Benefits

✅ **Automated Communication**: No manual email needed
✅ **Professional Appearance**: Modern, clean design impresses recipients
✅ **Complete Information**: All necessary details in one place
✅ **Improved Workflow**: Field workers are immediately notified
✅ **Reliable**: Non-blocking design ensures scheduling always works
✅ **Easy to Maintain**: Uses existing email infrastructure
