import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import ExcelJS from "exceljs"

export async function POST(request: NextRequest) {
    try {
        const { tables } = await request.json()

        if (!tables || !Array.isArray(tables) || tables.length === 0) {
            return NextResponse.json(
                { error: "Tables array is required" },
                { status: 400 }
            )
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook()

        // Process each selected table
        for (const table of tables) {
            let data: any[] = []
            let headers: string[] = []
            let sheetName = ""

            switch (table) {
                case "serviceRecords":
                    const serviceRecords = await prisma.serviceRecord.findMany({
                        include: {
                            projector: true,
                            site: true,
                            assignedTo: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                        orderBy: { createdAt: "desc" },
                    })

                    sheetName = "Service Records"
                    headers = [
                        "Service Number",
                        "Completion Date",
                        "Scheduled Date",
                        "Cinema Name",
                        "Address",
                        "Contact Details",
                        "Screen Number",
                        "Projector Model",
                        "Serial No",
                        "Engineer Name",
                        "Running Hours",
                        "Start Time",
                        "End Time",
                        "Remarks",
                        "Reflector",
                        "UV Filter",
                        "Integrator Rod",
                        "Cold Mirror",
                        "Fold Mirror",
                        "Touch Panel",
                        "EVB Board",
                        "IMCB Board",
                        "PIB Board",
                        "ICP Board",
                        "IMBS Board",
                        "Serial Verified",
                        "Air Intake LAD/RAD",
                        "Coolant Level/Color",
                        "LE White",
                        "LE Red",
                        "LE Green",
                        "LE Blue",
                        "LE Black",
                        "AC Blower",
                        "Extractor",
                        "Exhaust CFM",
                        "LE Fans",
                        "Card Cage Fans",
                        "Radiator/Pump",
                        "Pump Hose",
                        "Security Lock",
                        "Lamp LOC",
                        "Lamp Make/Model",
                        "Lamp Total Hours",
                        "Lamp Current Hours",
                        "PV vs N",
                        "PV vs E",
                        "NV vs E",
                        "fL Left",
                        "fL Right",
                        "Content Player",
                        "AC Status",
                        "LE Status",
                        "LE Serial Number",
                        "Screen Height",
                        "Screen Width",
                        "Flat Height",
                        "Flat Width",
                        "Screen Gain",
                        "Screen Make",
                        "Throw Distance",
                        "Focus Boresight",
                        "Integrator Position",
                        "Spots on Screen",
                        "Screen Cropping",
                        "Convergence",
                        "Channels Checked",
                        "Pixel Defects",
                        "Image Vibration",
                        "LiteLOC",
                        "Pollution Level",
                        "HCHO",
                        "TVOC",
                        "PM1",
                        "PM2.5",
                        "PM10",
                        "Temperature",
                        "Humidity",
                        "Photos Link",
                    ]

                    data = serviceRecords.map((record: any) => ({
                        "Service Number": record.serviceNumber || "",
                        "Completion Date": record.date ? new Date(record.date).toLocaleDateString() : "",
                        "Scheduled Date": record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "",
                        "Cinema Name": record.cinemaName || "",
                        Address: record.address || "",
                        "Contact Details": record.contactDetails || "",
                        "Screen Number": record.screenNumber || "",
                        "Projector Model": record.projector?.modelNo || "",
                        "Serial No": record.projector?.serialNo || "",
                        "Engineer Name": record.assignedTo?.name || "",
                        "Running Hours": record.projectorRunningHours || "",
                        "Start Time": record.startTime ? new Date(record.startTime).toLocaleString() : "",
                        "End Time": record.endTime ? new Date(record.endTime).toLocaleString() : "",
                        Remarks: record.remarks || "",
                        Reflector: record.reflector || "",
                        "UV Filter": record.uvFilter || "",
                        "Integrator Rod": record.integratorRod || "",
                        "Cold Mirror": record.coldMirror || "",
                        "Fold Mirror": record.foldMirror || "",
                        "Touch Panel": record.touchPanel || "",
                        "EVB Board": record.evbBoard || "",
                        "IMCB Board": record.ImcbBoard || "",
                        "PIB Board": record.pibBoard || "",
                        "ICP Board": record.IcpBoard || "",
                        "IMBS Board": record.imbSBoard || "",
                        "Serial Verified": record.serialNumberVerified || "",
                        "Air Intake LAD/RAD": record.AirIntakeLadRad || "",
                        "Coolant Level/Color": record.coolantLevelColor || "",
                        "LE White": record.lightEngineWhite || "",
                        "LE Red": record.lightEngineRed || "",
                        "LE Green": record.lightEngineGreen || "",
                        "LE Blue": record.lightEngineBlue || "",
                        "LE Black": record.lightEngineBlack || "",
                        "AC Blower": record.acBlowerVane || "",
                        Extractor: record.extractorVane || "",
                        "Exhaust CFM": record.exhaustCfm || "",
                        "LE Fans": record.lightEngineFans || "",
                        "Card Cage Fans": record.cardCageFans || "",
                        "Radiator/Pump": record.radiatorFanPump || "",
                        "Pump Hose": record.pumpConnectorHose || "",
                        "Security Lock": record.securityLampHouseLock || "",
                        "Lamp LOC": record.lampLocMechanism || "",
                        "Lamp Make/Model": record.lampMakeModel || "",
                        "Lamp Total Hours": record.lampTotalRunningHours || "",
                        "Lamp Current Hours": record.lampCurrentRunningHours || "",
                        "PV vs N": record.pvVsN || "",
                        "PV vs E": record.pvVsE || "",
                        "NV vs E": record.nvVsE || "",
                        "fL Left": record.flLeft || "",
                        "fL Right": record.flRight || "",
                        "Content Player": record.contentPlayerModel || "",
                        "AC Status": record.acStatus || "",
                        "LE Status": record.leStatus || "",
                        "LE Serial Number": record.lightEngineSerialNumber || "",
                        "Screen Height": record.screenHeight || "",
                        "Screen Width": record.screenWidth || "",
                        "Flat Height": record.flatHeight || "",
                        "Flat Width": record.flatWidth || "",
                        "Screen Gain": record.screenGain || "",
                        "Screen Make": record.screenMake || "",
                        "Throw Distance": record.throwDistance || "",
                        "Focus Boresight": record.focusBoresight || "",
                        "Integrator Position": record.integratorPosition || "",
                        "Spots on Screen": record.spotsOnScreen || "",
                        "Screen Cropping": record.screenCropping || "",
                        Convergence: record.convergence || "",
                        "Channels Checked": record.channelsChecked || "",
                        "Pixel Defects": record.pixelDefects || "",
                        "Image Vibration": record.imageVibration || "",
                        LiteLOC: record.liteloc || "",
                        "Pollution Level": record.airPollutionLevel || "",
                        HCHO: record.hcho || "",
                        TVOC: record.tvoc || "",
                        PM1: record.pm1 || "",
                        "PM2.5": record.pm2_5 || "",
                        PM10: record.pm10 || "",
                        Temperature: record.temperature || "",
                        Humidity: record.humidity || "",
                        "Photos Link": record.photosDriveLink || "",
                    }))
                    break

                case "projectors":
                    const projectors = await prisma.projector.findMany({
                        include: {
                            site: true,
                        },
                        orderBy: { serialNo: "asc" },
                    })

                    sheetName = "Projectors"
                    headers = ["Serial No", "Model No", "Site Name", "Status", "Last Service At", "Number of Services"]
                    data = projectors.map((p) => ({
                        "Serial No": p.serialNo,
                        "Model No": p.modelNo,
                        "Site Name": p.site?.siteName || "",
                        Status: p.status,
                        "Last Service At": p.lastServiceAt ? new Date(p.lastServiceAt).toLocaleDateString() : "",
                        "Number of Services": p.noOfservices || 0,
                    }))
                    break

                case "sites":
                    const sites = await prisma.site.findMany({
                        include: {
                            _count: {
                                select: { projector: true },
                            },
                        },
                        orderBy: { siteName: "asc" },
                    })

                    sheetName = "Sites"
                    headers = ["Site Name", "Site Code", "Address", "Contact Details", "Number of Projectors"]
                    data = sites.map((s) => ({
                        "Site Name": s.siteName,
                        "Site Code": s.siteCode || "",
                        Address: s.address,
                        "Contact Details": s.contactDetails,
                        "Number of Projectors": s._count.projector,
                    }))
                    break

                case "users":
                    const users = await prisma.user.findMany({
                        orderBy: { name: "asc" },
                    })

                    sheetName = "Users"
                    headers = ["Name", "Email", "Role", "Created At"]
                    data = users.map((u) => ({
                        Name: u.name,
                        Email: u.email,
                        Role: u.role,
                        "Created At": u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
                    }))
                    break

                default:
                    continue
            }

            // Create worksheet for this table
            const worksheet = workbook.addWorksheet(sheetName)

            // Add headers
            worksheet.addRow(headers)

            // Style header row
            const headerRow = worksheet.getRow(1)
            headerRow.font = { bold: true }
            headerRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            }

            // Add data rows
            data.forEach((row) => {
                const values = headers.map((header) => row[header] || "")
                worksheet.addRow(values)
            })

            // Auto-fit columns
            worksheet.columns.forEach((column) => {
                let maxLength = 0
                column.eachCell?.({ includeEmpty: true }, (cell) => {
                    const columnLength = cell.value ? String(cell.value).length : 10
                    if (columnLength > maxLength) {
                        maxLength = columnLength
                    }
                })
                column.width = maxLength < 10 ? 10 : maxLength > 50 ? 50 : maxLength + 2
            })
        }

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // Return as blob
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="export_${new Date().toISOString().split("T")[0]}.xlsx"`,
            },
        })
    } catch (error) {
        console.error("Error exporting data:", error)
        return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
    }
}
