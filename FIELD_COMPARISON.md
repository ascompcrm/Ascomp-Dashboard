# Form Fields vs PDF Generator Comparison

## ✅ Fields Present in Both

### Basic Information
- ✅ cinemaName / cinemaName
- ✅ date / date
- ✅ address / address
- ✅ contactDetails / contactDetails
- ✅ location / location
- ✅ screenNumber (screenNo in PDF)
- ✅ serviceVisitType (serviceVisit in PDF)
- ✅ projectorModel / projectorModel
- ✅ projectorSerialNumber (serialNo in PDF)
- ✅ projectorRunningHours (runningHours in PDF)
- ✅ lightEngineSerialNumber (leSerialNo in PDF)

### Opticals
- ✅ reflector
- ✅ uvFilter
- ✅ integratorRod
- ✅ coldMirror
- ✅ foldMirror

### Electronics
- ✅ touchPanel
- ✅ evbImcbBoard (evbImcb in PDF)
- ✅ pibIcpBoard (pibIcp in PDF)
- ✅ imbSBoard (imbS in PDF)
- ✅ disposableConsumables
- ✅ coolantLevelColor (coolant in PDF)

### Light Engine Test
- ✅ lightEngineWhite (white)
- ✅ lightEngineRed (red)
- ✅ lightEngineGreen (green)
- ✅ lightEngineBlue (blue)
- ✅ lightEngineBlack (black)

### Mechanical
- ✅ acBlowerVane (acBlower)
- ✅ extractorVane (extractor)
- ✅ exhaustCfm (exhaustCFM)
- ✅ lightEngineFans (lightEngine4Fans)
- ✅ cardCageFans
- ✅ radiatorFanPump (radiatorFan)
- ✅ pumpConnectorHose (connectorHose)
- ✅ securityLampHouseLock (securityLock)
- ✅ lampLocMechanism (lampLOC)

### Lamp Information
- ✅ lampMakeModel (lampMake)
- ✅ lampTotalRunningHours (lampHours)
- ✅ lampCurrentRunningHours

### Voltage & Measurements
- ✅ pvVsN (pvn)
- ✅ pvVsE (pve)
- ✅ nvVsE (nve)

### Content Player & Status
- ✅ contentPlayerModel (contentPlayer)
- ✅ acStatus
- ✅ leStatus

### Screen Information
- ✅ screenHeight (but PDF has separate scope/flat structure)
- ✅ screenWidth (but PDF has separate scope/flat structure)
- ✅ screenGain (but PDF has separate scope/flat structure)
- ✅ screenMake
- ✅ throwDistance

### Software & Other
- ✅ softwareVersion
- ✅ remarks

### Color Accuracy
- ✅ whiteX, whiteY, whiteFl (in mcgdData.w2k4k)
- ✅ redX, redY, redFl (in mcgdData.r2k4k)
- ✅ greenX, greenY, greenFl (in mcgdData.g2k4k)
- ✅ blueX, blueY, blueFl (in mcgdData.b2k4k)

### Image Evaluation
- ✅ focusBoresight (focusBoresite)
- ✅ integratorPosition
- ✅ spotsOnScreen (spotOnScreen)
- ✅ screenCroppingOk (screenCropping)
- ✅ convergenceOk (convergence)
- ✅ channelsCheckedOk (channelsChecked)
- ✅ pixelDefects
- ✅ imageVibration
- ✅ liteloc (liteLOC)

### Air Pollution
- ✅ hcho
- ✅ tvoc
- ✅ pm10
- ✅ pm2_5 (pm25 in PDF)
- ✅ temperature
- ✅ humidity

---

## ❌ MISSING FROM PDF GENERATOR

### 1. Service Timing (COMPLETELY MISSING)
- ❌ startTime
- ❌ endTime

### 2. Recommended Parts (COMPLETELY MISSING)
- ❌ recommendedParts (array of parts with part_number and description)

### 3. Issue Notes (COMPLETELY MISSING)
- ❌ issueNotes (object with component-specific notes/descriptions)

### 4. Report Information (COMPLETELY MISSING)
- ❌ reportGenerated (boolean)
- ❌ reportUrl (string)

### 5. fL Measurements Structure Issue
- Form has: **flCenter, flLeft, flRight** (3 separate fields)
- PDF has: **flMeasurements** (single combined field)
- **Issue**: Need to show all 3 separate measurements, not combine them

### 6. Screen Information Structure Issue
- Form has: **screenHeight, screenWidth, screenGain** (single values)
- PDF has: **scope.height, scope.width, scope.gain AND flat.height, flat.width, flat.gain**
- **Issue**: Form doesn't collect separate scope/flat data, but PDF expects it

### 7. PM1 Field Issue
- Form has: **pm1** (PM1.0)
- PDF has: **pm100** (might be typo - should be pm1)

### 8. CIE XYZ Structure Issue
- Form has: Separate X, Y, Fl for White, Red, Green, Blue (all in mcgdData structure)
- PDF has: **mcgdData** (correct) BUT also **cieXyz** (single set)
- **Issue**: Need clarification - is cieXyz a separate measurement or same as one of the color measurements?

### 9. Projector Placement Environment
- Form has: **projectorPlacementEnvironment** (textarea)
- PDF: Only mentioned as text on page but **NOT in data structure**

### 10. Serial Number Verified
- PDF has: **serialVerified** section
- Form: **MISSING** - not collected in form but shown in PDF

---

## 📝 SUMMARY

### Critical Missing Items:
1. **Service Timing** (startTime, endTime)
2. **Recommended Parts** (new feature we just added)
3. **Issue Notes** (component-specific notes)
4. **Report Generated Status & URL**

### Structure Differences to Address:
1. **fL Measurements** - need to show 3 separate values (center, left, right)
2. **Screen Info** - form has single values but PDF expects scope/flat split
3. **PM1** - naming discrepancy (pm1 vs pm100)

### Additional Considerations:
- **Projector Placement Environment** - mentioned in PDF but not in data structure
- **Serial Number Verified** - in PDF but not in form

