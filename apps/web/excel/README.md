# CSV Import Guide

This directory contains tools to import historical service data from Excel/CSV format into the database.

## Files

- `Details.csv` - Original CSV file with all service records
- `import-csv.ts` - TypeScript script to import CSV data into database
- `CSV_TO_SCHEMA_MAPPING.md` - Detailed field mapping documentation
- `IMPORT_QUESTIONS.md` - Questions about ambiguous mappings

## Prerequisites

1. **Install dependencies** (if not already installed):
   ```bash
   cd apps/web
   bun add csv-parse
   bun add -d @types/node
   ```

2. **Database setup**:
   - Ensure your database is running
   - Ensure `.env` file in `apps/web/` has correct `DATABASE_URL`
   - Run migrations: `bun run db:push`

## Import Process

### Step 1: Review Questions (Optional)

Check `IMPORT_QUESTIONS.md` to see assumptions made about data mapping. If you need to change any assumptions, edit `import-csv.ts`.

### Step 2: Run Import Script

From the project root:

```bash
cd apps/excel
bun run import-csv.ts
```

Or using tsx:

```bash
cd apps/excel
bunx tsx import-csv.ts
```

### Step 3: Verify Import

The script will output:
- Number of sites created
- Number of projectors created
- Number of service records created

You can also verify in the database or using Prisma Studio:

```bash
cd apps/web
bun run db:studio
```

## What Gets Imported

### Sites
- Created from unique addresses
- Fields: `siteName`, `address`, `contactDetails`, `screenNo`

### Projectors
- Created from unique serial numbers
- Fields: `projectorModel`, `serialNo`, `runningHours`
- Linked to sites via address

### Service Records
- All service records from CSV
- Fields mapped according to `CSV_TO_SCHEMA_MAPPING.md`
- Service numbers calculated sequentially per projector
- Status set to `COMPLETED` (historical data)

### Users
- Created from "Engineer Visited" field
- Email format: `engineer.name@field.ascomp.com`
- Role: `FIELD_WORKER`

## Data Transformations

The script handles:
- ✅ Date parsing ("Monday, January 01, 2024" → Date object)
- ✅ Number conversion (handles empty values, "x", "-")
- ✅ Boolean conversion (YES/OK → true)
- ✅ String cleaning (removes "-", "x", trims whitespace)
- ✅ Combining fields (EVB + IMCB boards, PIB + ICP boards)
- ✅ Combining remarks (Remark_1 through Remark_6)
- ✅ Creating recommended parts JSON (P1-P6 + PN1-PN6)
- ✅ Service number calculation (sequential per projector)

## Assumptions Made

See `IMPORT_QUESTIONS.md` for details. Current assumptions:

1. **Color measurements**: Uses 2K values (W2Kx, W2Ky, W2Kfl, etc.)
2. **Screen dimensions**: Uses Scope dimensions (Scope_H, Scope_W)
3. **FL center**: Left as null (not in CSV)
4. **Service numbers**: Sequential per projector by date

## Troubleshooting

### Error: "CSV file not found"
- Ensure `Details.csv` is in `apps/excel/` directory
- Check file name (case-sensitive)

### Error: "Database connection failed"
- Check `DATABASE_URL` in `apps/web/.env`
- Ensure database is running
- Run migrations: `bun run db:push`

### Error: "User already exists"
- The script uses `upsert`, so existing users won't cause errors
- If you see this, it's just a warning

### Duplicate service records
- The script uses `skipDuplicates: true` to prevent duplicates
- If you need to re-import, you may want to clear existing data first

## Re-importing Data

If you need to re-import:

1. **Option A: Clear and re-import** (⚠️ Deletes all data)
   ```typescript
   // Add to import-csv.ts before main():
   await prisma.serviceRecord.deleteMany({})
   await prisma.projector.deleteMany({})
   await prisma.site.deleteMany({})
   ```

2. **Option B: Skip duplicates** (Current behavior)
   - Script uses `upsert` and `skipDuplicates`
   - Existing records won't be updated

## Notes

- The script processes data in batches of 100 records
- Progress is logged every 100 rows
- Test records (where Cinema Name = "Test Record") are skipped
- Rows with missing serial numbers are skipped

