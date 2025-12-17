import { NextResponse } from "next/server"
import * as xlsx from "xlsx"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Path to the example Excel file
    const excelPath = path.join(process.cwd(), "excel", "Project_dets.xlsx")

    if (!fs.existsSync(excelPath)) {
      return NextResponse.json({ error: "Example Excel file not found" }, { status: 404 })
    }

    // Read the Excel file
    const workbook = xlsx.readFile(excelPath)
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