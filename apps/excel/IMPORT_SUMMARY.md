# CSV Import - Summary

## ✅ What Has Been Created

### 1. **Import Script** (`import-csv.ts`)
   - Full TypeScript script to import CSV data
   - Handles all data transformations
   - Creates Sites, Projectors, Users, and ServiceRecords
   - Processes 1639 rows from your CSV

### 2. **Documentation Files**
   - `CSV_TO_SCHEMA_MAPPING.md` - Complete field mapping reference
   - `IMPORT_QUESTIONS.md` - Questions about ambiguous mappings
   - `README.md` - Step-by-step import guide
   - `IMPORT_SUMMARY.md` - This file

## 🎯 What Gets Imported

### Sites
- ✅ Unique sites based on address
- ✅ Fields: siteName, address, contactDetails, screenNo

### Projectors  
- ✅ Unique projectors based on serial number
- ✅ Fields: projectorModel, serialNo, runningHours
- ✅ Linked to sites automatically

### Service Records
- ✅ All 1639 service records (excluding test rows)
- ✅ All fields mapped from CSV to schema
- ✅ Service numbers calculated sequentially per projector
- ✅ Status set to COMPLETED (historical data)

### Users
- ✅ Created from "Engineer Visited" field
- ✅ Email: `engineer.name@field.ascomp.com`
- ✅ Role: FIELD_WORKER

## ⚙️ Assumptions Made

The script uses these assumptions (see `IMPORT_QUESTIONS.md` for details):

1. ✅ **Color measurements**: Uses 2K values (W2Kx, W2Ky, W2Kfl, etc.)
2. ✅ **Screen dimensions**: Uses Scope dimensions (Scope_H, Scope_W)  
3. ✅ **FL center**: Left as null (not in CSV)
4. ✅ **Service numbers**: Sequential per projector by date
5. ✅ **Boolean fields**: YES/OK → true, others → false

**If you need to change any assumptions, edit `import-csv.ts`**

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd apps/web
bun add csv-parse
```

### Step 2: Run Import
```bash
cd apps/excel
bunx tsx import-csv.ts
```

### Step 3: Verify
```bash
cd apps/web
bun run db:studio
```

## 📋 Columns Used from CSV

The script only uses columns that map to your schema. Unused columns:
- ❌ YES1 through YES28 (unknown purpose)
- ❌ Air Pollution Level (not in schema)
- ❌ Some redundant measurement columns

## ⚠️ Important Notes

1. **Test Records**: Rows with "Test Record" as Cinema Name are skipped
2. **Missing Serial Numbers**: Rows without serial numbers are skipped  
3. **Duplicate Handling**: Uses `upsert` and `skipDuplicates` to prevent duplicates
4. **User Creation**: Users are created automatically from engineer names
5. **Service Numbers**: Calculated sequentially per projector (1, 2, 3...)

## 🔧 Customization

If you need to change mappings, edit `import-csv.ts`:

- **Color measurements**: Change `W2Kx` to `W4Kx` (line ~200)
- **Screen dimensions**: Change `Scope_H` to `Flat_H` (line ~220)
- **Service number logic**: Modify service number calculation (line ~150)

## 📊 Expected Results

After import, you should have:
- ~100-200 unique sites (depending on unique addresses)
- ~500-800 unique projectors (depending on unique serial numbers)
- ~1600 service records (excluding test rows)
- ~10-20 users (depending on unique engineer names)

## ❓ Questions?

Check `IMPORT_QUESTIONS.md` for questions about mappings. If you need to change anything, the script is well-commented and easy to modify.

## 🐛 Troubleshooting

See `README.md` for detailed troubleshooting steps.

Common issues:
- **CSV not found**: Ensure `Details.csv` is in `apps/excel/`
- **Database error**: Check `DATABASE_URL` in `apps/web/.env`
- **Import fails**: Check console output for specific error messages

