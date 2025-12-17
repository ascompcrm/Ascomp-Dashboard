import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import * as xlsx from "xlsx"
import { addDays, startOfDay } from "date-fns"
import {
  normalizeEmail,
  excelValueToDate,
  mapExcelRowToServiceRecordData,
} from "@/lib/excel-service-record-utils"

// Helper to generate Mongo-style IDs
const generateObjectId = () =>
  [...Array(24)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ]
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json({ error: "Invalid file type. Please upload an Excel file (.xlsx or .xls)" }, { status: 400 })
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer()
    const workbook = xlsx.read(arrayBuffer, { type: "array" })
    const sheet = workbook.Sheets["Data"]

    if (!sheet) {
      return NextResponse.json({ error: 'Sheet "Data" not found in Excel file. Please ensure your Excel file has a sheet named "Data"' }, { status: 400 })
    }

    const rows: Record<string, any>[] = xlsx.utils.sheet_to_json(sheet, { defval: null })

    if (rows.length === 0) {
      return NextResponse.json({ error: "Excel file is empty or has no data rows" }, { status: 400 })
    }

    // Validation phase - check all rows for issues
    const validationErrors: Array<{
      row: number
      serialNo?: string
      email?: string
      errors: string[]
    }> = []

    const userCache = new Map<string, { id: string; email: string | null } | null>()
    const projectorCache = new Map<string, { id: string; siteId: string } | null>()

    // Pre-load all users and projectors for validation
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true },
    })
    allUsers.forEach((user) => {
      if (user.email) {
        userCache.set(user.email.toLowerCase(), { id: user.id, email: user.email })
      }
    })

    const allProjectors = await prisma.projector.findMany({
      select: { id: true, serialNo: true, siteId: true },
    })
    allProjectors.forEach((projector) => {
      if (projector.serialNo) {
        projectorCache.set(projector.serialNo, { id: projector.id, siteId: projector.siteId })
      }
    })

    // Validate each row
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]!
      const rowNo = index + 2 // 1-based + header row
      const errors: string[] = []

      const serialNoRaw = row["Serial No."]
      const serialNo = serialNoRaw == null ? null : String(serialNoRaw).trim()
      const engineerEmailRaw = row["Engineer Visited"]
      const engineerEmailNorm = normalizeEmail(engineerEmailRaw)
      const dateRaw = row["Date"]
      const date = excelValueToDate(dateRaw)

      // Skip empty rows
      if (!serialNo && !engineerEmailNorm && !date) {
        continue
      }

      // Validate required fields
      if (!serialNo) {
        errors.push("Missing Serial No.")
      } else {
        // Validate projector exists
        const projectorInfo = projectorCache.get(serialNo)
        if (!projectorInfo) {
          errors.push(`Projector with Serial No. "${serialNo}" not found in database`)
        }
      }

      if (!engineerEmailNorm) {
        errors.push("Missing Engineer Visited (email)")
      } else {
        // Validate user exists
        const userInfo = userCache.get(engineerEmailNorm)
        if (!userInfo) {
          errors.push(`User with email "${engineerEmailNorm}" not found in database`)
        }
      }

      if (!date) {
        errors.push(`Invalid or missing Date (raw: ${JSON.stringify(dateRaw)})`)
      }

      if (errors.length > 0) {
        validationErrors.push({
          row: rowNo,
          serialNo: serialNo || undefined,
          email: engineerEmailNorm || undefined,
          errors,
        })
      }
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          validationErrors,
          totalRows: rows.length,
          validRows: rows.length - validationErrors.length,
        },
        { status: 400 }
      )
    }

    // All validation passed - now process the upload
    // Reuse the sync logic from sync_service_records_from_excel.ts
    // For brevity, we'll do a simplified version here
    // In production, you might want to extract the sync logic to a shared utility

    let createdCount = 0
    let updatedCount = 0

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]!
      const serialNo = String(row["Serial No."]).trim()
      const engineerEmailNorm = normalizeEmail(row["Engineer Visited"])!
      const date = excelValueToDate(row["Date"])!

      const userInfo = userCache.get(engineerEmailNorm)!
      const projectorInfo = projectorCache.get(serialNo)!

      // Map Excel fields to ServiceRecord data using shared utility
      const mappedData = mapExcelRowToServiceRecordData(row)

      const data: any = {
        ...mappedData,
        date,
        user: { connect: { id: userInfo.id } },
        assignedTo: { connect: { id: userInfo.id } },
        projector: { connect: { id: projectorInfo.id } },
        site: { connect: { id: projectorInfo.siteId } },
      }

      // Match existing ServiceRecords by projectorId + calendar date
      const dayStart = startOfDay(date)
      const dayEnd = addDays(dayStart, 1)

      const existingRecords = await prisma.serviceRecord.findMany({
        where: {
          projectorId: projectorInfo.id,
          date: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
        select: { id: true },
      })

      // Also check by (projectorId, serviceNumber) to avoid unique constraint violations
      let recordsByServiceNumber: { id: string }[] = []
      if (existingRecords.length === 0 && data.serviceNumber) {
        recordsByServiceNumber = await prisma.serviceRecord.findMany({
          where: {
            projectorId: projectorInfo.id,
            serviceNumber: data.serviceNumber,
          },
          select: { id: true },
        })
      }

      const recordsToUpdate = existingRecords.length > 0 ? existingRecords : recordsByServiceNumber

      if (recordsToUpdate.length === 0) {
        // Create new
        await prisma.serviceRecord.create({
          data: {
            ...data,
            id: generateObjectId(),
          },
        })
        createdCount++
      } else {
        // Update existing
        for (const rec of recordsToUpdate) {
          await prisma.serviceRecord.update({
            where: { id: rec.id },
            data,
          })
          updatedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${rows.length} rows`,
      created: createdCount,
      updated: updatedCount,
      totalRows: rows.length,
    })
  } catch (error) {
    console.error("Excel upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to process Excel file",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}