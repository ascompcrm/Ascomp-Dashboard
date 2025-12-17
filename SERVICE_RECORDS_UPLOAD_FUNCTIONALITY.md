# Service Records Excel Upload Functionality

## Overview

This document describes the Excel upload functionality for service records that has been added to the admin overview view. The feature allows administrators to upload service records from Excel files, with comprehensive validation and error handling.

## Features Implemented

### 1. **Upload Dialog Component** (`UploadServiceRecordsDialog`)

Located in: `src/components/admin/overview-view.tsx`

**Features:**
- File selection restricted to Excel files (.xlsx, .xls)
- Real-time file preview (first 10 rows)
- Download example Excel template
- Comprehensive validation before upload
- Detailed error reporting with row-level feedback
- Success/error status messages
- Disabled upload button when validation errors exist

### 2. **Upload API Endpoint**

**Endpoint:** `POST /api/admin/service-records/upload-excel`

**Location:** `src/app/api/admin/service-records/upload-excel/route.ts`

**Functionality:**
- Accepts Excel file via FormData
- Validates file type and structure (requires "Data" sheet)
- Pre-validates all rows for:
  - Required fields (Serial No., Engineer Visited email, Date)
  - User existence in database (by email)
  - Projector existence in database (by Serial No.)
  - Valid date format
- Processes upload by:
  - Matching existing records by (projectorId, date) or (projectorId, serviceNumber)
  - Updating existing records or creating new ones
  - Using the full field mapping from Excel to ServiceRecord schema

**Response Format:**
- Success: `{ success: true, message: string, created: number, updated: number, totalRows: number }`
- Validation Error: `{ error: string, validationErrors: Array<{ row, serialNo?, email?, errors: string[] }>, totalRows, validRows }`
- Error: `{ error: string, details: string }`

### 3. **Download Example API Endpoint**

**Endpoint:** `GET /api/admin/service-records/download-example`

**Location:** `src/app/api/admin/service-records/download-example/route.ts`

**Functionality:**
- Reads the example Excel file from `excel/Project_dets.xlsx`
- Extracts headers only (creates template with no data rows)
- Returns Excel file as download: `Service_Records_Template.xlsx`

### 4. **Shared Utility Functions**

**Location:** `src/lib/excel-service-record-utils.ts`

**Functions:**
- `isEmpty()` - Check if value is empty/null
- `toStringOrNull()` - Convert value to string or null
- `toIntOrNull()` - Convert value to integer or null
- `toFloatOrNull()` - Convert value to float or null
- `yesNoOkToString()` - Convert Yes/No/Ok values to string
- `yesNoToBool()` - Convert Yes/No/Ok to boolean
- `normalizeEmail()` - Normalize email addresses
- `excelValueToDate()` - Robust date parsing from Excel (handles serial numbers, Date objects, various string formats)
- `mapExcelRowToServiceRecordData()` - Maps Excel row to ServiceRecord data object with all field mappings

**Field Mappings:**
The utility includes comprehensive field mappings matching the sync script logic:
- Basic info (serviceNumber, date, cinemaName, address, contactDetails, location, screenNumber)
- Projector/lamp data (projectorRunningHours, lampMakeModel, lampTotalRunningHours, lampCurrentRunningHours)
- Status fields with notes (reflector, uvFilter, integratorRod, coldMirror, foldMirror, touchPanel, evbBoard, etc.)
- Light engine fields (white, red, green, blue, black)
- Mechanical fields (acBlowerVane, extractorVane, exhaustCfm, fans, etc.)
- Screen/photometry data (screenHeight, screenWidth, flatHeight, flatWidth, screenGain, throwDistance, etc.)
- Color measurements (white2Kx, white2Ky, white2Kfl, red2Kx, etc.)
- Environmental data (airPollutionLevel, hcho, tvoc, pm1, pm2.5, pm10, temperature, humidity)
- QA flags (focusBoresight, integratorPosition, spotsOnScreen, screenCropping, convergence, channelsChecked)
- Other fields (pixelDefects, imageVibration, liteloc, recommendedParts, photosDriveLink)

## Validation Rules

### Required Fields
1. **Serial No.** - Must exist and match a projector in the database
2. **Engineer Visited** - Must be a valid email and match a user in the database
3. **Date** - Must be a valid date (supports Excel serial numbers, Date objects, various string formats)

### Database Validation
- **User Validation:** Each "Engineer Visited" email must exist in the `User` table
- **Projector Validation:** Each "Serial No." must exist in the `Projector` table

### File Validation
- File type must be `.xlsx` or `.xls`
- File must contain a sheet named "Data"
- File must have at least one data row

## Excel File Format

The Excel file must follow the format defined in `excel/Project_dets.xlsx`:

- **Sheet Name:** "Data"
- **Headers:** Various headers as defined in the field mapping (Date, Serial No., Engineer Visited, Service Visit, Cinema Name, Address, etc.)
- **Column Variants Supported:**
  - `Screen No:` or `Screen No`
  - `Projector Number of hours running:` or `Projector Running Hours`
  - `Drive Link`, `Drive link`, `Photos Drive Link`, `photo`, `Photo` (for photosDriveLink)
  - Plain text headers for status notes (e.g., `Reflector` for reflectorNote instead of `Reflector Status`)

## User Experience Flow

1. **Click Upload Button:**
   - Opens the upload dialog

2. **Download Example (Optional):**
   - User can click "Download Example Excel File" to get a template
   - Template contains headers only (no data rows)

3. **Select File:**
   - User selects an Excel file from their computer
   - File is immediately validated for type and structure
   - Preview of first 10 rows is displayed

4. **Validation:**
   - On clicking "Upload", the file is sent to the API
   - API validates all rows
   - If validation errors exist:
     - Errors are displayed with row numbers and details
     - Upload button remains disabled
     - User must fix errors in Excel and try again
   - If validation passes:
     - File is processed
     - Success message shows counts (created/updated)
     - Records are refreshed automatically
     - Dialog closes after 2 seconds

5. **Success/Error Feedback:**
   - Success: Green message with counts
   - Error: Red message with details
   - Validation errors: Detailed list with row numbers

## Integration Points

### Overview View Integration

The upload functionality is integrated into:
- **File:** `src/components/admin/overview-view.tsx`
- **Button:** Upload button in the header (line ~1860)
- **State:** `uploadDialogOpen` state variable
- **Refresh:** `onSuccess` callback refreshes the records list after successful upload

### API Integration

The upload endpoint uses:
- **Prisma:** Database operations via `@/lib/db`
- **xlsx library:** Excel file parsing
- **date-fns:** Date manipulation (startOfDay, addDays)
- **Shared utilities:** Field mapping logic from `@/lib/excel-service-record-utils`

## Error Handling

### Client-Side Errors
- Invalid file type → Error message displayed
- Missing "Data" sheet → Error message displayed
- File read errors → Error message displayed

### Server-Side Errors
- Validation errors → Detailed list returned with row numbers
- Database errors → Error message with details
- Processing errors → Error message with stack trace (in development)

## Technical Details

### Matching Logic
The upload uses the same matching logic as the sync script:
1. First, tries to match by `(projectorId, date)` within the same calendar day
2. If no match, tries to match by `(projectorId, serviceNumber)` to avoid unique constraint violations
3. Updates existing records or creates new ones accordingly

### Field Type Conversions
- **Strings:** Trimmed and converted to null if empty
- **Numbers:** Parsed with comma handling, null if invalid
- **Dates:** Supports Excel serial numbers, Date objects, multiple string formats
- **Booleans:** Yes/No/Ok converted to "true"/"false" strings (as per Prisma schema)
- **Arrays:** Recommended parts array constructed from multiple columns

### Performance Considerations
- User and projector caches pre-loaded for validation
- Batch processing of rows
- Efficient date matching using date range queries

## Future Enhancements (Optional)

Potential improvements:
1. Progress indicator for large files
2. Partial upload support (upload valid rows, skip invalid ones)
3. Export validation errors to Excel
4. Bulk edit capabilities
5. File upload history/audit log

## Testing Recommendations

1. **Valid File Test:**
   - Upload a properly formatted Excel file
   - Verify records are created/updated correctly

2. **Validation Test:**
   - Upload file with missing Serial No.
   - Upload file with invalid email
   - Upload file with invalid date
   - Verify error messages are clear

3. **Database Test:**
   - Upload file with non-existent user email
   - Upload file with non-existent projector serial
   - Verify validation catches these errors

4. **Format Test:**
   - Test various date formats
   - Test different header variants
   - Verify field mappings work correctly

5. **Edge Cases:**
   - Empty file
   - Very large file
   - File with special characters
   - Duplicate records in Excel

## Files Modified/Created

### New Files:
1. `src/app/api/admin/service-records/upload-excel/route.ts` - Upload API endpoint
2. `src/app/api/admin/service-records/download-example/route.ts` - Download example API endpoint
3. `src/lib/excel-service-record-utils.ts` - Shared utility functions
4. `SERVICE_RECORDS_UPLOAD_FUNCTIONALITY.md` - This documentation file

### Modified Files:
1. `src/components/admin/overview-view.tsx` - Added UploadServiceRecordsDialog component and integration

## Dependencies

The functionality relies on:
- `xlsx` - Excel file parsing
- `date-fns` - Date manipulation
- `@prisma/client` - Database operations
- React hooks (useState, useEffect)
- Next.js API routes
- UI components (Dialog, Button, Input, Label, etc.)

## Notes

- The upload functionality uses the same field mapping logic as the sync script (`excel/sync_service_records_from_excel.ts`) for consistency
- Validation is performed before upload to prevent partial data corruption
- The example Excel file is generated from the actual `Project_dets.xlsx` file to ensure format consistency
- The upload endpoint handles both creating new records and updating existing ones based on matching criteria
