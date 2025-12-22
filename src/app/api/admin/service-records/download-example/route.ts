import { NextResponse } from "next/server"
import * as xlsx from "xlsx"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Path to the example Excel file
    const excelPath = path.join(process.cwd(), "excel", "Project_dets.xlsx")

    // Check if file exists
    if (!fs.existsSync(excelPath)) {
      console.error(`Excel file not found at path: ${excelPath}`)
      return NextResponse.json({
        error: "Example Excel file not found",
        path: excelPath
      }, { status: 404 })
    }

    // Check file permissions
    try {
      fs.accessSync(excelPath, fs.constants.R_OK)
    } catch (accessError) {
      console.error(`Cannot read Excel file at ${excelPath}:`, accessError)
      return NextResponse.json({
        error: "Cannot read Excel file - permission denied",
        path: excelPath
      }, { status: 403 })
    }

    // Read the Excel file as buffer
    let fileBuffer: Buffer
    try {
      fileBuffer = fs.readFileSync(excelPath)
    } catch (readError) {
      console.error(`Error reading Excel file:`, readError)
      return NextResponse.json({
        error: "Failed to read Excel file",
        details: readError instanceof Error ? readError.message : String(readError)
      }, { status: 500 })
    }

    // Parse the buffer with xlsx
    let workbook: xlsx.WorkBook
    try {
      workbook = xlsx.read(fileBuffer, { type: 'buffer' })
    } catch (parseError) {
      console.error(`Error parsing Excel file:`, parseError)
      return NextResponse.json({
        error: "Failed to parse Excel file",
        details: parseError instanceof Error ? parseError.message : String(parseError)
      }, { status: 500 })
    }

    const sheet = workbook.Sheets["Data"]

    if (!sheet) {
      return NextResponse.json({ error: 'Sheet "Data" not found in example file' }, { status: 500 })
    }

    // Create a new workbook with just the headers (first row)
    const headerRow: any = {}
    const range = xlsx.utils.decode_range(sheet["!ref"] || "A1")

    // Get headers from first row
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col })
      const cell = sheet[cellAddress]
      if (cell) {
        headerRow[cellAddress] = cell
      }
    }

    // Create a new sheet with just headers
    const newSheet: any = {
      ...headerRow,
      "!ref": xlsx.utils.encode_range({ s: { r: 0, c: range.s.c }, e: { r: 0, c: range.e.c } }),
    }

    // Create a new workbook
    const newWorkbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Data")

    // Generate buffer
    const buffer = xlsx.write(newWorkbook, { type: "buffer", bookType: "xlsx" })

    // Return file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Service_Records_Template.xlsx",
      },
    })
  } catch (error) {
    console.error("Error generating example Excel file:", error)
    return NextResponse.json(
      {
        error: "Failed to generate example Excel file",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}