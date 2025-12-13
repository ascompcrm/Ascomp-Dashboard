# Form Sections Analysis: Dynamic vs Hardcoded

**Last Updated:** After refactoring to make sections dynamic

## ✅ **DYNAMIC SECTIONS** (Connected to Admin Dashboard)
These sections use `renderFieldsBySection()` and will update when you change them in the admin dashboard:

1. **Cinema Details** ✅ - Fully dynamic
2. **Projector Information** ✅ - Fully dynamic
3. **Opticals** ✅ - Fully dynamic (refactored)
   - Uses `StatusSelectWithNote` component with configurable options
   - Note options configurable: `['Solarized', 'Chipped', 'Cracked', 'Not Present']`
   - All fields configurable via admin dashboard
4. **Electronics** ✅ - Fully dynamic (refactored)
   - Uses `StatusSelectWithNote` component with configurable options
   - All fields configurable via admin dashboard
5. **Serial Number Verified** ✅ - Fully dynamic (refactored)
   - Field `serialNumberVerified` with configurable note default
   - Configurable via admin dashboard
6. **Disposable Consumables** ✅ - Fully dynamic (refactored)
   - Field `AirIntakeLadRad` configurable via admin dashboard
7. **Coolant** ✅ - Fully dynamic (refactored)
   - Field `coolantLevelColor` configurable via admin dashboard
8. **Light Engine Test Pattern** ✅ - Fully dynamic (refactored)
   - All light engine color fields configurable via admin dashboard
9. **Mechanical** ✅ - Fully dynamic (refactored)
   - All mechanical fields including `exhaustCfm`, `pumpConnectorHose`, `securityLampHouseLock`, `lampLocMechanism`, `projectorPlacementEnvironment`
   - Note options configurable for specific fields (e.g., `acBlowerVane`, `extractorVane`, `securityLampHouseLock`)
   - All fields configurable via admin dashboard
10. **Lamp Information** ✅ - Fully dynamic
11. **Voltage Parameters** ✅ - Fully dynamic
12. **fL Measurements** ✅ - Fully dynamic
13. **Content Player & AC Status** ✅ - Fully dynamic
14. **Image Evaluation** ✅ - Fully dynamic (refactored)
    - All image evaluation fields configurable via admin dashboard
    - Dropdown options configurable
15. **Air Pollution Data** ✅ - Fully dynamic
16. **Remarks** ✅ - Fully dynamic

## ⚠️ **PARTIALLY DYNAMIC SECTIONS**
These sections have some dynamic fields but also contain hardcoded elements:

17. **Software & Screen Information** ⚠️
    - Dynamic: Uses `renderFieldsBySection()` for most fields
    - Hardcoded: "Scope Dimensions" (screenHeight, screenWidth) and "Flat Dimensions" (flatHeight, flatWidth) are hardcoded below the dynamic fields
    - Note: These fields exist in config but are excluded from dynamic rendering to maintain the special layout

## ❌ **HARDCODED SECTIONS** (NOT Connected to Admin Dashboard)
These sections are completely hardcoded and will NOT update when you change them in the admin dashboard:

18. **Color Accuracy - MCGD** ❌
    - Uses `COLOR_ACCURACY` constant with hardcoded color fields
    - Hardcoded structure with 2K/4K values for White, Red, Green, Blue
    - Complex nested structure requires special handling
    - Changes in admin dashboard will NOT reflect here
    - **Reason:** Complex nested structure (2K/4K values per color) would require advanced form config structure

19. **Color Accuracy - CIE XYZ** ❌
    - Hardcoded fields: `BW_Step_10_2Kx`, `BW_Step_10_2Ky`, `BW_Step_10_2Kfl`, `BW_Step_10_4Kx`, `BW_Step_10_4Ky`, `BW_Step_10_4Kfl`
    - Hardcoded structure with 2K/4K values
    - Changes in admin dashboard will NOT reflect here
    - **Reason:** Complex nested structure would require advanced form config structure

20. **Recommended Parts** ❌
    - Hardcoded dialog and logic for selecting parts from `Projector.json`
    - Not connected to form config at all
    - Changes in admin dashboard will NOT reflect here
    - **Reason:** Special feature with dialog, checkbox selection, and integration with Projector.json file

21. **Service Images** ❌
    - Hardcoded image upload functionality
    - Not connected to form config
    - Changes in admin dashboard will NOT reflect here
    - **Reason:** Special image upload feature with blob storage integration

## Summary

- **16 sections** are fully dynamic ✅ (8 originally + 8 refactored)
- **1 section** is partially dynamic ⚠️
- **4 sections** are completely hardcoded ❌ (down from 12)

## Technical Implementation

### StatusSelectWithNote Component Support
The form config now supports special component types:
- `componentType: "statusSelectWithNote"` - Enables StatusSelectWithNote component
- `noteOptions: string[]` - Configurable note dropdown options (shown when status is "YES")
- `noteDefault: string` - Default value for note field
- `optionDescriptions: Record<string, string>` - Descriptions for dropdown options

### Admin Dashboard Features
- Checkbox to enable "Status Select With Note" component type
- UI to add/remove note options
- Input field for note default value
- All changes save to `form-config.json` and reflect on user side

## Remaining Work (Optional)

To make the remaining 4 sections fully dynamic, you would need to:
1. **Color Accuracy sections:** Design a nested form config structure to handle 2K/4K value pairs per color
2. **Recommended Parts:** Create a configurable parts selection system (may require changes to Projector.json structure)
3. **Service Images:** Make image upload requirements configurable (e.g., min/max images, categories)

These are intentionally left hardcoded as they require more complex configuration structures.

