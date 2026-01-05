// Shared utility functions for Excel service record processing
// Used by both sync scripts and API endpoints

export const isEmpty = (v: any) => v === null || v === undefined || v === "" || v === "-"

export const toStringOrNull = (v: any): string | null => {
  if (isEmpty(v)) return null
  return String(v).trim()
}

export const toIntOrNull = (v: any): number | null => {
  if (isEmpty(v)) return null
  const n = typeof v === "number" ? v : parseInt(String(v).replace(/,/g, ""), 10)
  return Number.isFinite(n) ? n : null
}

export const toFloatOrNull = (v: any): number | null => {
  if (isEmpty(v)) return null
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

export const yesNoOkToString = (v: any): string | null => {
  if (isEmpty(v)) return null
  return String(v).trim()
}

export const yesNoToBool = (v: any): boolean => {
  if (typeof v === "boolean") return v
  const s = String(v ?? "").trim().toLowerCase()
  return s === "yes" || s === "y" || s === "ok" || s === "true" || s === "1"
}

export const normalizeEmail = (v: any): string | null => {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  if (!s) return null
  return s.toLowerCase()
}

// Known valid status values for sanitization
const validStatusPrefixes = [
  'OK', 'YES', 'Concern', 'Working', 'Not Working', 'Not Available',
  'Removed', 'Not removed', 'OK (Part is Ok)', 'YES (Needs Replacement)'
]

// Sanitize status field value - removes any note-like patterns
// e.g., "Concern - Red colour on screen" → "Concern"
// e.g., "YES (Needs Replacement) - some note" → "YES (Needs Replacement)"
export const sanitizeStatusValue = (value: string | null): string | null => {
  if (!value || typeof value !== 'string') return value

  // Check if the value contains " - " which indicates note was incorrectly appended
  const separatorIndex = value.indexOf(' - ')
  if (separatorIndex === -1) return value // No separator, value is clean

  // Extract the part before " - "
  const statusPart = value.substring(0, separatorIndex).trim()

  // Check if the extracted part looks like a valid status
  const isValidStatus = validStatusPrefixes.some(prefix =>
    statusPart === prefix || statusPart.startsWith(prefix)
  )

  if (isValidStatus) {
    // Return just the status part, removing the note
    return statusPart
  }

  // If we can't identify a valid status prefix, return original
  return value
}

// Robust Excel date → JS Date (handles serials, JS Dates, common string formats)
import { isValid as isValidDate } from "date-fns"

export const excelValueToDate = (v: any): Date | null => {
  if (v instanceof Date) {
    return isValidDate(v) ? v : null
  }

  if (typeof v === "number") {
    // Excel serial days from 1899-12-30
    const ms = (v - 25569) * 86400 * 1000
    const d = new Date(ms)
    return isValidDate(d) ? d : null
  }

  if (v == null || v === "") return null

  const s = String(v).trim()
  if (!s) return null

  // Try common date formats
  const formats = [
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, // DD/MM/YYYY or MM/DD/YYYY
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/, // YYYY-MM-DD
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/, // DD/MM/YY or MM/DD/YY
  ]

  for (const format of formats) {
    const match = s.match(format)
    if (match) {
      let year: number, month: number, day: number
      if (match[1]!.length === 4) {
        // YYYY-MM-DD
        year = parseInt(match[1]!, 10)
        month = parseInt(match[2]!, 10) - 1
        day = parseInt(match[3]!, 10)
      } else {
        // DD/MM/YYYY or MM/DD/YYYY - try both
        const v1 = parseInt(match[1]!, 10)
        const v2 = parseInt(match[2]!, 10)
        const v3 = parseInt(match[3]!, 10)
        if (v3 > 31) {
          year = v3
          month = v2 - 1
          day = v1
        } else if (v1 > 12) {
          // DD/MM/YY
          day = v1
          month = v2 - 1
          year = v3 < 50 ? 2000 + v3 : 1900 + v3
        } else {
          // MM/DD/YY
          month = v1 - 1
          day = v2
          year = v3 < 50 ? 2000 + v3 : 1900 + v3
        }
      }
      const d = new Date(year, month, day)
      if (isValidDate(d)) return d
    }
  }

  // Try ISO string parsing
  const parsed = new Date(s)
  if (isValidDate(parsed)) return parsed

  return null
}

// Map Excel row to ServiceRecord data object
export const mapExcelRowToServiceRecordData = (row: Record<string, any>) => {
  const serviceVisit = row["Service Visit"]
  const cinemaName = row["Cinema Name"]
  const address = row["Address"]
  const contactDetails = row["Contact Details"]
  const screenNo = row["Screen No:"] ?? row["Screen No"]
  const lampModelMake = row["Lamp Model & Make"]
  const projectorRunningHours = toIntOrNull(row["Projector Number of hours running:"] ?? row["Projector Running Hours"])
  const lampTotalRunningHours = toIntOrNull(row["Lamp Number of hours running:"])
  const lampCurrentRunningHours = toIntOrNull(row["Current Lamp Hours"])

  // Status fields (using plain text headers)
  const reflectorStatus = toStringOrNull(row["Reflector"])
  const uvFilterStatus = toStringOrNull(row["UV filter"])
  const integratorRodStatus = toStringOrNull(row["Integrator Rod"])
  const coldMirrorStatus = toStringOrNull(row["Cold Mirror"])
  const foldMirrorStatus = toStringOrNull(row["Fold Mirror"])
  const touchPanelStatus = toStringOrNull(row["Touch Panel"])
  const evbBoardStatus = toStringOrNull(row["EVB Board"])
  const ImcbBoardStatus = toStringOrNull(row["IMCB Board/s"])
  const pibBoardStatus = toStringOrNull(row["PIB Board"])
  const IcpBoardStatus = toStringOrNull(row["ICP Board"])
  const imbSBoardStatus = toStringOrNull(row["IMB/S Board"])
  const chassisStatus = toStringOrNull(row["Chassis label vs Touch Panel"])
  const leLadRadStatus = toStringOrNull(row["LE, LAD and RAD"])
  const levelColorStatus = toStringOrNull(row["Level and Color"])

  const reflectorYesNo = yesNoOkToString(row["Reflector Yes/No/Ok"])
  const uvFilterYesNo = yesNoOkToString(row["UV filter Yes/No/Ok"])
  const integratorRodYesNo = yesNoOkToString(row["Integrator Rod Yes/No/Ok"])
  const coldMirrorYesNo = yesNoOkToString(row["Cold Mirror Yes/No/Ok"])
  const foldMirrorYesNo = yesNoOkToString(row["Fold Mirror Yes/No/Ok"])
  const touchPanelYesNo = yesNoOkToString(row["Touch Panel Yes/No/Ok"])
  const evbBoardYesNo = yesNoOkToString(row["EVB Board Yes/No/Ok"])
  const ImcbBoardYesNo = yesNoOkToString(row["IMCB Board/s Yes/No/Ok"])
  const pibBoardYesNo = yesNoOkToString(row["PIB Board Yes/No/Ok"])
  const IcpBoardYesNo = yesNoOkToString(row["ICP Board Yes/No/Ok"])
  const imbSBoardYesNo = yesNoOkToString(row["IMB/S Board Yes/No/Ok"])
  const chassisYesNo = yesNoOkToString(row["Chassis label vs Touch Yes/No/Ok"])
  const leLadRadYesNo = yesNoOkToString(row["LE, LAD and RAD Yes/No/Ok"])
  const levelColorYesNo = yesNoOkToString(row["Level and Color Yes/No/Ok"])

  const whiteStatus = toStringOrNull(row["White"])
  const redStatus = toStringOrNull(row["Red"])
  const greenStatus = toStringOrNull(row["Green"])
  const blueStatus = toStringOrNull(row["Blue"])
  const blackStatus = toStringOrNull(row["Black"])

  const whiteYesNo = yesNoOkToString(row["White Yes/No/Ok"])
  const redYesNo = yesNoOkToString(row["Red Yes/No/Ok"])
  const greenYesNo = yesNoOkToString(row["Green Yes/No/Ok"])
  const blueYesNo = yesNoOkToString(row["Blue Yes/No/Ok"])
  const blackYesNo = yesNoOkToString(row["Black Yes/No/Ok"])

  const acBlowerStatus = toStringOrNull(row["AC blower and Vane Switch"])
  const extractorStatus = toStringOrNull(row["Extractor Vane Switch"])
  const exhaustCfmStatus = toStringOrNull(row["Exhaust CFM"])
  const leFansStatus = toStringOrNull(row["Light Engine 4 fans with LAD fan"])
  const cardCageFansStatus = toStringOrNull(row["Card Cage Top and Bottom fans"])
  const radiatorFanStatus = toStringOrNull(row["Radiator fan and Pump"])
  const pumpConnectorStatus = toStringOrNull(row["Connector and hose for the Pump"])
  const securityLockStatus = toStringOrNull(row["Security and lamp house lock switch"])
  const lampLocStatus = toStringOrNull(row["Lamp LOC Mechanism X,Y and Z movement"])

  const acBlowerYesNo = yesNoOkToString(row["AC blower and Vane Switch Yes/No/Ok"])
  const extractorYesNo = yesNoOkToString(row["Extractor Vane Switch Yes/No/Ok"])
  const exhaustCfmYesNo = yesNoOkToString(row["Exhaust CFM Yes/No/Ok"])
  const leFansYesNo = yesNoOkToString(row["Light Engine 4 fans with LAD fan Yes/No/Ok"])
  const cardCageFansYesNo = yesNoOkToString(row["Card Cage Top and Bottom fans Yes/No/Ok"])
  const radiatorFanYesNo = yesNoOkToString(row["Radiator fan and Pump Yes/No/Ok"])
  const pumpConnectorYesNo = yesNoOkToString(row["Connector and hose for the Pump Yes/No/Ok"])
  const securityLockYesNo = yesNoOkToString(row["Security and lamp house lock switch Yes/No/Ok"])
  const lampLocYesNo = yesNoOkToString(row["Lamp LOC Mechanism X,Y and Z movement Yes/No/Ok"])

  const screenHeight = toFloatOrNull(row["Scope_H"])
  const screenWidth = toFloatOrNull(row["Scope_W"])
  const flatHeight = toFloatOrNull(row["Flat_H"])
  const flatWidth = toFloatOrNull(row["Flat_W"])
  const screenMake = toStringOrNull(row["Screen Make"])
  const throwDistance = toFloatOrNull(row["Throw Distance"])
  const screenGain = toFloatOrNull(row["Gain"])

  const BW_Step_10_2Kx = toStringOrNull(row["BW Step-10 2K x"])
  const BW_Step_10_2Ky = toStringOrNull(row["BW Step-10 2K y"])
  const BW_Step_10_2Kfl = toStringOrNull(row["BW Step-10 2K fl"])
  const BW_Step_10_4Kx = toStringOrNull(row["BW Step-10 4K x2"])
  const BW_Step_10_4Ky = toStringOrNull(row["BW Step-10 4K y2"])
  const BW_Step_10_4Kfl = toStringOrNull(row["BW Step-10 4K fl2"])

  const white2Kx = toFloatOrNull(row["W2Kx"])
  const white4Kx = toFloatOrNull(row["W4Kx"])
  const red2Kx = toFloatOrNull(row["R2Kx"])
  const red4Kx = toFloatOrNull(row["R4Kx"])
  const green2Kx = toFloatOrNull(row["G2Kx"])
  const green4Kx = toFloatOrNull(row["G4Kx"])
  const blue2Kx = toFloatOrNull(row["B2Kx"])
  const blue4Kx = toFloatOrNull(row["B4Kx"])

  const white2Ky = toFloatOrNull(row["W2Ky"])
  const white4Ky = toFloatOrNull(row["W4Ky"])
  const red2Ky = toFloatOrNull(row["R2Ky"])
  const red4Ky = toFloatOrNull(row["R4Ky"])
  const green2Ky = toFloatOrNull(row["G2Ky"])
  const green4Ky = toFloatOrNull(row["G4Ky"])
  const blue2Ky = toFloatOrNull(row["B2Ky"])
  const blue4Ky = toFloatOrNull(row["B4Ky"])

  const white2Kfl = toFloatOrNull(row["W2Kfl"])
  const white4Kfl = toFloatOrNull(row["W4Kfl"])
  const red2Kfl = toFloatOrNull(row["R2Kfl"])
  const red4Kfl = toFloatOrNull(row["R4Kfl"])
  const green2Kfl = toFloatOrNull(row["G2Kfl"])
  const green4Kfl = toFloatOrNull(row["G4Kfl"])
  const blue2Kfl = toFloatOrNull(row["B2Kfl"])
  const blue4Kfl = toFloatOrNull(row["B4Kfl"])

  const softwareVersion = toStringOrNull(row["Software Version"])
  const airPollutionLevel = toStringOrNull(row["Air Pollution Level"])
  const hcho = toFloatOrNull(row["HCHO"])
  const tvoc = toFloatOrNull(row["TVOC"])
  const pm1 = toFloatOrNull(row["PM 1"])
  const pm2_5 = toFloatOrNull(row["PM 2.5"])
  const pm10 = toFloatOrNull(row["PM 10"])
  const temperature = toFloatOrNull(row["Temperature"])
  const humidity = toFloatOrNull(row["Humidity"])

  const focusFlag = row["Focus"]
  const integratorFlag = row["Intergrator"]
  const spotsFlag = row["Any Spot on Screen after PPM"]
  const croppingFlag = row["Check Screen cropping - FLAT and SCOPE"]
  const convergenceFlag = row["Convergence checked"]
  const channelsFlag = row["Channels Checked - Scope, Flat, Alternative"]

  const pixelDefects = toStringOrNull(row["Pixel Defects"])
  const imageVibration = toStringOrNull(row["Excessive Image Vibration"])
  const liteloc = toStringOrNull(row["LiteLOC"])

  const recommendedParts: any[] = []
  for (let i = 1; i <= 6; i++) {
    const name = toStringOrNull(row[`Recommeded Part ${i}`])
    const partNumber = toStringOrNull(row[`Recommeded Part Number ${i}`])
    if (!name && !partNumber) continue
    recommendedParts.push({ name, partNumber })
  }

  const driveLinkRaw =
    row["Drive Link"] ??
    row["Drive link"] ??
    row["Photos Drive Link"] ??
    row["Photos drive link"] ??
    row["Drive_Link"] ??
    row["photo"] ??
    row["Photo"]

  return {
    serviceNumber: String(serviceVisit ?? ""),
    cinemaName: toStringOrNull(cinemaName),
    address: toStringOrNull(address),
    contactDetails: toStringOrNull(contactDetails),
    location: toStringOrNull(address),
    screenNumber: toStringOrNull(screenNo),
    projectorRunningHours,
    lampMakeModel: toStringOrNull(lampModelMake),
    lampTotalRunningHours,
    lampCurrentRunningHours,
    // Apply sanitization to all status fields
    reflector: sanitizeStatusValue(reflectorYesNo),
    uvFilter: sanitizeStatusValue(uvFilterYesNo),
    integratorRod: sanitizeStatusValue(integratorRodYesNo),
    coldMirror: sanitizeStatusValue(coldMirrorYesNo),
    foldMirror: sanitizeStatusValue(foldMirrorYesNo),
    touchPanel: sanitizeStatusValue(touchPanelYesNo),
    evbBoard: sanitizeStatusValue(evbBoardYesNo),
    ImcbBoard: sanitizeStatusValue(ImcbBoardYesNo),
    pibBoard: sanitizeStatusValue(pibBoardYesNo),
    IcpBoard: sanitizeStatusValue(IcpBoardYesNo),
    imbSBoard: sanitizeStatusValue(imbSBoardYesNo),
    serialNumberVerified: sanitizeStatusValue(chassisYesNo),
    AirIntakeLadRad: sanitizeStatusValue(leLadRadYesNo),
    coolantLevelColor: sanitizeStatusValue(levelColorYesNo),
    reflectorNote: reflectorStatus,
    uvFilterNote: uvFilterStatus,
    integratorRodNote: integratorRodStatus,
    coldMirrorNote: coldMirrorStatus,
    foldMirrorNote: foldMirrorStatus,
    touchPanelNote: touchPanelStatus,
    evbBoardNote: evbBoardStatus,
    ImcbBoardNote: ImcbBoardStatus,
    pibBoardNote: pibBoardStatus,
    IcpBoardNote: IcpBoardStatus,
    imbSBoardNote: imbSBoardStatus,
    serialNumberVerifiedNote: chassisStatus,
    AirIntakeLadRadNote: leLadRadStatus,
    coolantLevelColorNote: levelColorStatus,
    lightEngineWhite: sanitizeStatusValue(whiteYesNo),
    lightEngineRed: sanitizeStatusValue(redYesNo),
    lightEngineGreen: sanitizeStatusValue(greenYesNo),
    lightEngineBlue: sanitizeStatusValue(blueYesNo),
    lightEngineBlack: sanitizeStatusValue(blackYesNo),
    lightEngineWhiteNote: whiteStatus,
    lightEngineRedNote: redStatus,
    lightEngineGreenNote: greenStatus,
    lightEngineBlueNote: blueStatus,
    lightEngineBlackNote: blackStatus,
    acBlowerVane: sanitizeStatusValue(acBlowerYesNo),
    extractorVane: sanitizeStatusValue(extractorYesNo),
    exhaustCfm: sanitizeStatusValue(exhaustCfmYesNo),
    lightEngineFans: sanitizeStatusValue(leFansYesNo),
    cardCageFans: sanitizeStatusValue(cardCageFansYesNo),
    radiatorFanPump: sanitizeStatusValue(radiatorFanYesNo),
    pumpConnectorHose: sanitizeStatusValue(pumpConnectorYesNo),
    securityLampHouseLock: sanitizeStatusValue(securityLockYesNo),
    lampLocMechanism: sanitizeStatusValue(lampLocYesNo),
    acBlowerVaneNote: acBlowerStatus,
    extractorVaneNote: extractorStatus,
    exhaustCfmNote: exhaustCfmStatus,
    lightEngineFansNote: leFansStatus,
    cardCageFansNote: cardCageFansStatus,
    radiatorFanPumpNote: radiatorFanStatus,
    pumpConnectorHoseNote: pumpConnectorStatus,
    securityLampHouseLockNote: securityLockStatus,
    lampLocMechanismNote: lampLocStatus,
    projectorPlacementEnvironment: toStringOrNull(row["Room"]),
    softwareVersion,
    screenHeight,
    screenWidth,
    flatHeight,
    flatWidth,
    screenGain,
    screenMake,
    throwDistance,
    pvVsN: toStringOrNull(row[" P V N"]),
    pvVsE: toStringOrNull(row["P V E"]),
    nvVsE: toStringOrNull(row["N VS E"]),
    flLeft: toFloatOrNull(row["  fL_B"]),
    flRight: toFloatOrNull(row["  fL_A"]),
    contentPlayerModel: toStringOrNull(row["Content player model"]),
    acStatus: toStringOrNull(row["AC Status"]),
    leStatus: toStringOrNull(row["LE Status"]),
    remarks: toStringOrNull(row["Remarks"]),
    lightEngineSerialNumber: toStringOrNull(row["LE S No"]),
    BW_Step_10_2Kx,
    BW_Step_10_2Ky,
    BW_Step_10_2Kfl,
    BW_Step_10_4Kx,
    BW_Step_10_4Ky,
    BW_Step_10_4Kfl,
    white2Kx,
    white2Ky,
    white2Kfl,
    white4Kx,
    white4Ky,
    white4Kfl,
    red2Kx,
    red2Ky,
    red2Kfl,
    red4Kx,
    red4Ky,
    red4Kfl,
    green2Kx,
    green2Ky,
    green2Kfl,
    green4Kx,
    green4Ky,
    green4Kfl,
    blue2Kx,
    blue2Ky,
    blue2Kfl,
    blue4Kx,
    blue4Ky,
    blue4Kfl,
    airPollutionLevel,
    hcho,
    tvoc,
    pm1,
    pm2_5,
    pm10,
    temperature,
    humidity,
    focusBoresight: isEmpty(focusFlag) ? null : String(yesNoToBool(focusFlag)),
    integratorPosition: isEmpty(integratorFlag) ? null : String(yesNoToBool(integratorFlag)),
    spotsOnScreen: isEmpty(spotsFlag) ? null : String(yesNoToBool(spotsFlag)),
    screenCropping: isEmpty(croppingFlag) ? null : String(yesNoToBool(croppingFlag)),
    convergence: isEmpty(convergenceFlag) ? null : String(yesNoToBool(convergenceFlag)),
    channelsChecked: isEmpty(channelsFlag) ? null : String(yesNoToBool(channelsFlag)),
    pixelDefects,
    imageVibration,
    liteloc,
    recommendedParts: recommendedParts.length > 0 ? recommendedParts : null,
    photosDriveLink: toStringOrNull(driveLinkRaw),
    reportGenerated: false,
    images: [],
    brokenImages: [],
  }
}