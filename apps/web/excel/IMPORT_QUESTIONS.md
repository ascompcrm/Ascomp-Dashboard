# Questions for CSV Import Mapping

## Questions I Need Answered:

### 1. **Color Measurements - Which columns to use?**
Your CSV has multiple columns for color measurements:
- **White**: `x`, `y`, `fl` OR `x2`, `y2`, `fl2` OR `W2Kx`, `W4Kx`, `W2Ky`, `W4Ky`, `W2Kfl`, `W4Kfl`
- **Red**: `R2Kx`, `R4Kx`, `R2Ky`, `R4Ky`, `R2Kfl`, `R4Kfl`
- **Green**: `G2Kx`, `G4Kx`, `G2Ky`, `G4Ky`, `G2Kfl`, `G4Kfl`
- **Blue**: `B2Kx`, `B4Kx`, `B2Ky`, `B4Ky`, `B2Kfl`, `B4Kfl`

**Question**: Which should I use?
- Option A: Use 2K values (`W2Kx`, `W2Ky`, `W2Kfl`, etc.)
- Option B: Use 4K values (`W4Kx`, `W4Ky`, `W4Kfl`, etc.)
- Option C: Use the simple `x`, `y`, `fl` columns
- Option D: Store both 2K and 4K (would need schema changes)


**My recommendation**: Use 2K values (Option A) based on codebase structure.

---

### 2. **Screen Dimensions - Scope or Flat?**
Your CSV has:
- `Scope_H`, `Scope_W` (Scope dimensions)
- `Flat_H`, `Flat_W` (Flat dimensions)

But your schema has single values:
- `screenHeight`
- `screenWidth`

**Question**: Which should I use?
- Option A: Use Scope dimensions (`Scope_H` → `screenHeight`, `Scope_W` → `screenWidth`)
- Option B: Use Flat dimensions (`Flat_H` → `screenHeight`, `Flat_W` → `screenWidth`)
- Option C: Use whichever is available (Scope if available, else Flat)

**My recommendation**: Use Scope dimensions (Option A) as primary.

---

### 3. **FL Measurements - Missing Center Value**
Your schema has:
- `flCenter` (Float?)
- `flLeft` (Float?) - maps to `  fL_A`
- `flRight` (Float?) - maps to `  fL_B`

**Question**: What should I use for `flCenter`?
- Option A: Leave it null (not in CSV)
- Option B: Calculate average of flLeft and flRight
- Option C: There's another column I'm missing?

**My recommendation**: Leave it null (Option A).

---

### 4. **Disposable Consumables**
Your schema has `disposableConsumables` (String?) but I don't see a matching column in the CSV.

**Question**: 
- Is this field in the CSV under a different name?
- Should I leave it null?
- Should I combine it from other columns?

**My recommendation**: Leave it null if not found.

---

### 5. **Service Visit Type / Service Number**
Your CSV has `Service Visit` with values like "First", "First Record", etc.

**Question**: How should I convert this to `serviceNumber` (Int)?
- Option A: "First" = 1, "Second" = 2, etc. (per projector)
- Option B: Sequential number based on date per projector
- Option C: Keep as-is and convert to number

**My recommendation**: Option B - Sequential number based on date per projector.

---

### 6. **YES1 through YES28 Columns**
Your CSV has `YES1`, `Yes2`, `YES3` through `YES28` columns that don't map to any schema fields.

**Question**: 
- Are these important? Should I store them somewhere?
- Can I ignore them?
- Do they map to any boolean fields I'm missing?

**My recommendation**: Ignore them unless you tell me otherwise.

---

### 7. **Air Pollution Level**
Your CSV has `Air Pollution Level` column but schema doesn't have this field.

**Question**: Should I ignore this or is there a field I'm missing?

**My recommendation**: Ignore it.

---

### 8. **Start Time / End Time**
Your schema has `startTime` and `endTime` (DateTime?) but CSV doesn't have these.

**Question**: Should I leave these null?

**My recommendation**: Leave them null.

---

## My Proposed Mapping (Pending Your Confirmation)

I'll proceed with these assumptions unless you correct me:

1. ✅ Use **2K color values** (W2Kx, W2Ky, W2Kfl, etc.)
2. ✅ Use **Scope dimensions** (Scope_H, Scope_W)
3. ✅ Leave **flCenter** null
4. ✅ Leave **disposableConsumables** null
5. ✅ Calculate **serviceNumber** sequentially per projector by date
6. ✅ Ignore **YES1-YES28** columns
7. ✅ Ignore **Air Pollution Level**
8. ✅ Leave **startTime/endTime** null

**Please confirm or correct these assumptions!**

