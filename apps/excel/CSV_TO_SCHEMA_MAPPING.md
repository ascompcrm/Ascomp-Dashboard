# CSV to Prisma Schema Mapping Analysis

## Overview
This document maps CSV columns to Prisma schema fields for Sites, Projectors, and ServiceRecords.

## Issues Found

### 1. **Column Name Inconsistencies**
- Some CSV columns have trailing spaces (e.g., "Contact Details " vs "Contact Details")
- Some columns use different naming conventions (e.g., "Screen No:" vs "screenNumber")
- Some columns have special characters that need handling

### 2. **Data Structure Issues**
- The CSV combines Site, Projector, and ServiceRecord data in one row
- Need to extract and normalize data into separate entities
- Some fields may need data transformation

### 3. **Missing or Mismatched Fields**
- Some schema fields don't have direct CSV equivalents
- Some CSV columns don't map to schema fields
- Boolean fields in CSV may be text (YES/OK/-) that need conversion

---

## Detailed Field Mapping

### SITE Model Mapping

| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `id` | *Generated* | Need to generate unique ID (e.g., UUID) |
| `siteName` | `Cinema Name` | ✅ Direct mapping |
| `address` | `Address` | ✅ Direct mapping (must be unique) |
| `contactDetails` | `Contact Details ` | ⚠️ Note trailing space in CSV |
| `screenNo` | `Screen No:` | ⚠️ Note colon in CSV column name |

**Recommendation**: Rename CSV column `Contact Details ` → `Contact Details` and `Screen No:` → `Screen No`

---

### PROJECTOR Model Mapping

| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `id` | *Generated* | Need to generate unique ID |
| `projectorModel` | `Projector Model` | ✅ Direct mapping |
| `serialNo` | `Serial No.` | ✅ Direct mapping (must be unique) |
| `noOfservices` | *Calculated* | Count service records per projector |
| `runningHours` | `Projector Number of hours running:` | ✅ Direct mapping |
| `siteId` | *Derived* | Link to Site via Address |
| `lastServiceAt` | *Derived* | Latest date from service records |
| `nextServiceAt` | *Calculated* | Based on service schedule |

**Recommendation**: No changes needed for Projector columns

---

### SERVICERECORD Model Mapping

#### Basic Information
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `id` | *Generated* | Generate unique ID |
| `date` | `Date` | ⚠️ Format: "Monday, January 01, 2024" - needs parsing |
| `serviceNumber` | `Service Visit` | ⚠️ Values like "First", "First Record" - may need normalization |
| `status` | *Default* | Set to COMPLETED (assuming historical data) |
| `cinemaName` | `Cinema Name` | ✅ Direct mapping |
| `address` | `Address` | ✅ Direct mapping |
| `contactDetails` | `Contact Details ` | ⚠️ Trailing space |
| `screenNumber` | `Screen No:` | ⚠️ Colon in column name |
| `projectorRunningHours` | `Projector Number of hours running:` | ✅ Direct mapping |
| `location` | `Room` | ✅ Direct mapping |

#### Projector Components
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `reflector` | `Reflector` | ✅ Direct mapping |
| `uvFilter` | `UV filter` | ⚠️ Case difference (UV filter vs uvFilter) |
| `integratorRod` | `Integrator Rod` | ✅ Direct mapping |
| `coldMirror` | `Cold Mirror` | ✅ Direct mapping |
| `foldMirror` | `Fold Mirror` | ✅ Direct mapping |
| `touchPanel` | `Touch Panel` | ✅ Direct mapping |
| `evbImcbBoard` | `EVB Board` + `IMCB Board/s` | ⚠️ Two columns combined |
| `pibIcpBoard` | `PIB Board` + `ICP Board` | ⚠️ Two columns combined |
| `imbSBoard` | `IMB/S Board` | ✅ Direct mapping |
| `serialNumberVerified` | `Chassis label vs Touch Panel` | ⚠️ May need interpretation |

#### Light Engine & Cooling
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `coolantLevelColor` | `Level and Color` | ✅ Direct mapping |
| `lightEngineWhite` | `White` | ✅ Direct mapping |
| `lightEngineRed` | `Red` | ✅ Direct mapping |
| `lightEngineGreen` | `Green` | ✅ Direct mapping |
| `lightEngineBlue` | `Blue` | ✅ Direct mapping |
| `lightEngineBlack` | `Black` | ✅ Direct mapping |
| `acBlowerVane` | `AC blower and Vane Switch` | ✅ Direct mapping |
| `extractorVane` | `Extractor Vane Switch` | ✅ Direct mapping |
| `exhaustCfm` | `Exhaust CFM` | ✅ Direct mapping |
| `lightEngineFans` | `Light Engine 4 fans with LAD fan` | ✅ Direct mapping |
| `cardCageFans` | `Card Cage Top and Bottom fans` | ✅ Direct mapping |
| `radiatorFanPump` | `Radiator fan and Pump` | ✅ Direct mapping |
| `pumpConnectorHose` | `Connector and hose for the Pump` | ✅ Direct mapping |
| `securityLampHouseLock` | `Security and lamp house lock switch` | ✅ Direct mapping |
| `lampLocMechanism` | `Lamp LOC Mechanism X,Y and Z movement` | ✅ Direct mapping |

#### Lamp Information
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `lampMakeModel` | `Lamp Model & Make` | ✅ Direct mapping |
| `lampTotalRunningHours` | `Lamp Number of hours running:` | ✅ Direct mapping |
| `lampCurrentRunningHours` | `Current Lamp Hours` | ✅ Direct mapping |

#### Status & Measurements
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `leStatus` | `LE Status` | ✅ Direct mapping |
| `acStatus` | `AC Status` | ✅ Direct mapping |
| `lightEngineSerialNumber` | `LE S No` | ✅ Direct mapping |
| `pvVsN` | `P V N` | ⚠️ Spaces in column name |
| `pvVsE` | `P V E` | ⚠️ Spaces in column name |
| `nvVsE` | `N VS E` | ⚠️ Spaces and case difference |
| `flLeft` | `  fL_B` | ⚠️ Leading spaces, underscore |
| `flRight` | `  fL_A` | ⚠️ Leading spaces, underscore |
| `contentPlayerModel` | `Content player model` | ✅ Direct mapping |

#### Screen Information
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `screenHeight` | `Scope_H` or `Flat_H` | ⚠️ Two columns, need logic |
| `screenWidth` | `Scope_W` or `Flat_W` | ⚠️ Two columns, need logic |
| `screenGain` | `Gain` | ✅ Direct mapping |
| `screenMake` | `Screen Make` | ✅ Direct mapping |
| `throwDistance` | `Throw Distance` | ✅ Direct mapping |

#### Color Measurements (White)
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `whiteX` | `x` or `x2` | ⚠️ Multiple columns, need logic |
| `whiteY` | `y` or `y2` | ⚠️ Multiple columns, need logic |
| `whiteFl` | `fl` or `fl2` | ⚠️ Multiple columns, need logic |

#### Color Measurements (Red)
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `redX` | `R2Kx` or `R4Kx` | ⚠️ Multiple columns, need logic |
| `redY` | `R2Ky` or `R4Ky` | ⚠️ Multiple columns, need logic |
| `redFl` | `R2Kfl` or `R4Kfl` | ⚠️ Multiple columns, need logic |

#### Color Measurements (Green)
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `greenX` | `G2Kx` or `G4Kx` | ⚠️ Multiple columns, need logic |
| `greenY` | `G2Ky` or `G4Ky` | ⚠️ Multiple columns, need logic |
| `greenFl` | `G2Kfl` or `G4Kfl` | ⚠️ Multiple columns, need logic |

#### Color Measurements (Blue)
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `blueX` | `B2Kx` or `B4Kx` | ⚠️ Multiple columns, need logic |
| `blueY` | `B2Ky` or `B4Ky` | ⚠️ Multiple columns, need logic |
| `blueFl` | `B2Kfl` or `B4Kfl` | ⚠️ Multiple columns, need logic |

#### Software & Environment
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `softwareVersion` | `Software Version` | ✅ Direct mapping |
| `projectorPlacementEnvironment` | `Room` | ⚠️ Already mapped to location |
| `hcho` | `HCHO` | ✅ Direct mapping |
| `tvoc` | `TVOC` | ✅ Direct mapping |
| `pm1` | `PM 1` | ✅ Direct mapping |
| `pm2_5` | `PM 2.5` | ⚠️ Space in CSV, underscore in schema |
| `pm10` | `PM 10` | ✅ Direct mapping |
| `temperature` | `Temperature` | ✅ Direct mapping |
| `humidity` | `Humidity` | ✅ Direct mapping |

#### Boolean Fields (Need Conversion)
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `focusBoresight` | `Focus` | ⚠️ Convert text to boolean |
| `integratorPosition` | `Intergrator` | ⚠️ Typo in CSV, convert to boolean |
| `spotsOnScreen` | `Any Spot on Screen after PPM` | ⚠️ Convert text to boolean |
| `screenCroppingOk` | `Check Screen cropping - FLAT and SCOPE` | ⚠️ Convert text to boolean |
| `convergenceOk` | `Convergence checked` | ⚠️ Convert text to boolean |
| `channelsCheckedOk` | `Channels Checked - Scope, Flat, Alternative` | ⚠️ Convert text to boolean |

#### Text Fields
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `pixelDefects` | `Pixel Defects` | ✅ Direct mapping |
| `imageVibration` | `Excessive Image Vibration` | ✅ Direct mapping |
| `liteloc` | `LiteLOC` | ⚠️ Case difference |
| `remarks` | `Remark_1` to `Remark_6` | ⚠️ Multiple columns, need to combine |

#### Recommended Parts
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `recommendedParts` | `P1` to `P6` + `PN1` to `PN6` | ⚠️ JSON structure needed |
| | | Combine part names (P1-P6) with part numbers (PN1-PN6) |

#### Images
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `images` | `photo` | ⚠️ Google Drive URL, may need processing |

#### User Assignment
| Prisma Field | CSV Column | Notes |
|-------------|------------|-------|
| `userId` | *Derived* | Need to create/link User from "Engineer Visited" |
| `assignedToId` | *Derived* | Same as userId for historical data |

---

## Recommended CSV Column Renames

To make import easier, consider renaming these columns in your CSV:

1. `Contact Details ` → `Contact Details` (remove trailing space)
2. `Screen No:` → `Screen No` (remove colon)
3. `UV filter` → `UV Filter` (capitalize for consistency)
4. `P V N` → `PVN` (remove spaces)
5. `P V E` → `PVE` (remove spaces)
6. `N VS E` → `NVS_E` (standardize)
7. `  fL_B` → `FL_B` (remove leading spaces)
8. `  fL_A` → `FL_A` (remove leading spaces)
9. `PM 2.5` → `PM_2_5` (use underscore)
10. `Intergrator` → `Integrator` (fix typo)

---

## Data Transformation Needed

### 1. Date Parsing
- CSV format: "Monday, January 01, 2024"
- Need to parse to DateTime object

### 2. Service Number Normalization
- CSV has: "First", "First Record", etc.
- Need to convert to integer (1, 2, 3...) per projector

### 3. Boolean Conversion
- Convert YES/OK/- to boolean values
- Handle text descriptions

### 4. Combined Fields
- `evbImcbBoard`: Combine "EVB Board" + "IMCB Board/s"
- `pibIcpBoard`: Combine "PIB Board" + "ICP Board"
- `remarks`: Combine Remark_1 through Remark_6
- `recommendedParts`: Create JSON from P1-P6 and PN1-PN6

### 5. Color Measurement Logic
- Determine which column to use (2K vs 4K, x vs x2, etc.)
- May need business logic to decide

### 6. Screen Dimensions
- Choose between Scope_H/Scope_W vs Flat_H/Flat_W
- May need business logic

### 7. User Creation
- Create User records from "Engineer Visited" field
- Link to service records

---

## Fields Not Mapped

### CSV Columns Not Used
- `YES1` through `YES28` - Unknown purpose, may be checklist items
- `Air Pollution Level` - Not in schema
- Some measurement columns may be redundant

### Schema Fields Not in CSV
- `replacementRequired` - Set default false
- `disposableConsumables` - Not in CSV
- `startTime`, `endTime` - Not in CSV
- `signatures` - Not in CSV
- `reportGenerated`, `reportUrl` - Set defaults
- `brokenImages` - Not in CSV

---

## Next Steps

1. **Clean CSV Column Names** (optional but recommended)
   - Remove trailing spaces
   - Standardize naming
   - Fix typos

2. **Create Import Script**
   - Parse CSV
   - Create Sites (deduplicate by address)
   - Create Projectors (deduplicate by serialNo)
   - Create ServiceRecords
   - Link relationships

3. **Handle Data Quality**
   - Validate required fields
   - Handle missing data
   - Normalize text values

4. **Test Import**
   - Start with small subset
   - Verify relationships
   - Check data integrity

