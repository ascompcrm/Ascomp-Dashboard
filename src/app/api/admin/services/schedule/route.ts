import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"

// Helper to generate Mongo-style IDs (since schema uses string IDs)
const generateObjectId = () => [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join("")

// Helper to convert number to ordinal word
const numberToOrdinalWord = (num: number): string => {
  const ordinals = [
    "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth",
    "Eleventh", "Twelfth", "Thirteenth", "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth",
    "Eighteenth", "Nineteenth", "Twentieth", "Twenty-First", "Twenty-Second", "Twenty-Third",
    "Twenty-Fourth", "Twenty-Fifth", "Twenty-Sixth", "Twenty-Seventh", "Twenty-Eighth",
    "Twenty-Ninth", "Thirtieth", "Thirty-First", "Thirty-Second", "Thirty-Third", "Thirty-Fourth",
    "Thirty-Fifth", "Thirty-Sixth", "Thirty-Seventh", "Thirty-Eighth", "Thirty-Ninth", "Fortieth",
    "Forty-First", "Forty-Second", "Forty-Third", "Forty-Fourth", "Forty-Fifth", "Forty-Sixth",
    "Forty-Seventh", "Forty-Eighth", "Forty-Ninth", "Fiftieth", "Fifty-First", "Fifty-Second",
    "Fifty-Third", "Fifty-Fourth", "Fifty-Fifth", "Fifty-Sixth", "Fifty-Seventh", "Fifty-Eighth",
    "Fifty-Ninth", "Sixtieth", "Sixty-First", "Sixty-Second", "Sixty-Third", "Sixty-Fourth",
    "Sixty-Fifth", "Sixty-Sixth", "Sixty-Seventh", "Sixty-Eighth", "Sixty-Ninth", "Seventieth",
    "Seventy-First", "Seventy-Second", "Seventy-Third", "Seventy-Fourth", "Seventy-Fifth",
    "Seventy-Sixth", "Seventy-Seventh", "Seventy-Eighth", "Seventy-Ninth", "Eightieth",
    "Eighty-First", "Eighty-Second", "Eighty-Third", "Eighty-Fourth", "Eighty-Fifth",
    "Eighty-Sixth", "Eighty-Seventh", "Eighty-Eighth", "Eighty-Ninth", "Ninetieth",
    "Ninety-First", "Ninety-Second", "Ninety-Third", "Ninety-Fourth", "Ninety-Fifth",
    "Ninety-Sixth", "Ninety-Seventh", "Ninety-Eighth", "Ninety-Ninth", "One Hundredth"
  ]

  if (num >= 1 && num <= 100) {
    return ordinals[num - 1]!
  }

  // Fallback for numbers beyond 100
  return `${num}th`
}

export async function POST(request: NextRequest) {
  try {
    const { siteId, projectorId, fieldWorkerId, scheduledDate } = await request.json()

    if (!siteId || !projectorId || !fieldWorkerId || !scheduledDate) {
      return NextResponse.json(
        { error: "Site, projector, field worker and scheduled date are required." },
        { status: 400 },
      )
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    })
    if (!site) {
      return NextResponse.json({ error: "Site not found." }, { status: 404 })
    }

    const projector = await prisma.projector.findUnique({
      where: { id: projectorId },
    })
    if (!projector || projector.siteId !== siteId) {
      return NextResponse.json({ error: "Projector not found for this site." }, { status: 404 })
    }

    const fieldWorker = await prisma.user.findFirst({
      where: { id: fieldWorkerId, role: "FIELD_WORKER" },
      select: { id: true },
    })
    if (!fieldWorker) {
      return NextResponse.json({ error: "Field worker not found." }, { status: 404 })
    }

    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    })
    if (!admin) {
      return NextResponse.json({ error: "Admin user not found." }, { status: 500 })
    }

    const parsedDate = new Date(scheduledDate)
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid scheduled date." }, { status: 400 })
    }

    // Check if an uncompleted service record already exists for this projector
    const existingRecord = await prisma.serviceRecord.findFirst({
      where: {
        projectorId,
        date: null,  // Not completed yet
      },
      orderBy: {
        createdAt: "desc",  // Get the latest one
      },
    })

    let record

    if (existingRecord) {
      // Update the existing service record with new assignment
      record = await prisma.serviceRecord.update({
        where: { id: existingRecord.id },
        data: {
          assignedToId: fieldWorker.id,
        },
      })
    } else {
      // Create a new service record
      // Find the highest service number for this projector to avoid unique constraint violations
      const existingRecords = await prisma.serviceRecord.findMany({
        where: { projectorId },
        select: { serviceNumber: true },
      })

      // Parse ordinal words back to numbers to find the max
      const ordinalToNumber = (ordinal: string): number => {
        const ordinals = [
          "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth",
          "Eleventh", "Twelfth", "Thirteenth", "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth",
          "Eighteenth", "Nineteenth", "Twentieth", "Twenty-First", "Twenty-Second", "Twenty-Third",
          "Twenty-Fourth", "Twenty-Fifth", "Twenty-Sixth", "Twenty-Seventh", "Twenty-Eighth",
          "Twenty-Ninth", "Thirtieth", "Thirty-First", "Thirty-Second", "Thirty-Third", "Thirty-Fourth",
          "Thirty-Fifth", "Thirty-Sixth", "Thirty-Seventh", "Thirty-Eighth", "Thirty-Ninth", "Fortieth",
          "Forty-First", "Forty-Second", "Forty-Third", "Forty-Fourth", "Forty-Fifth", "Forty-Sixth",
          "Forty-Seventh", "Forty-Eighth", "Forty-Ninth", "Fiftieth", "Fifty-First", "Fifty-Second",
          "Fifty-Third", "Fifty-Fourth", "Fifty-Fifth", "Fifty-Sixth", "Fifty-Seventh", "Fifty-Eighth",
          "Fifty-Ninth", "Sixtieth", "Sixty-First", "Sixty-Second", "Sixty-Third", "Sixty-Fourth",
          "Sixty-Fifth", "Sixty-Sixth", "Sixty-Seventh", "Sixty-Eighth", "Sixty-Ninth", "Seventieth",
          "Seventy-First", "Seventy-Second", "Seventy-Third", "Seventy-Fourth", "Seventy-Fifth",
          "Seventy-Sixth", "Seventy-Seventh", "Seventy-Eighth", "Seventy-Ninth", "Eightieth",
          "Eighty-First", "Eighty-Second", "Eighty-Third", "Eighty-Fourth", "Eighty-Fifth",
          "Eighty-Sixth", "Eighty-Seventh", "Eighty-Eighth", "Eighty-Ninth", "Ninetieth",
          "Ninety-First", "Ninety-Second", "Ninety-Third", "Ninety-Fourth", "Ninety-Fifth",
          "Ninety-Sixth", "Ninety-Seventh", "Ninety-Eighth", "Ninety-Ninth", "One Hundredth"
        ]
        const index = ordinals.indexOf(ordinal)
        return index !== -1 ? index + 1 : 0
      }

      const maxServiceNumber = existingRecords.reduce((max, record) => {
        const num = ordinalToNumber(record.serviceNumber || "")
        return num > max ? num : max
      }, 0)

      const nextServiceNumber = maxServiceNumber + 1

      record = await prisma.serviceRecord.create({
        data: {
          id: generateObjectId(),
          userId: admin.id,
          assignedToId: fieldWorker.id,
          projectorId: projector.id,
          siteId: site.id,
          serviceNumber: numberToOrdinalWord(nextServiceNumber) as any,
          cinemaName: site.siteName,
          address: site.address,
          contactDetails: site.contactDetails,
          location: site.address,
        },
      })
    }

    // Update projector status to SCHEDULED
    await prisma.projector.update({
      where: { id: projectorId },
      data: {
        status: ServiceStatus.SCHEDULED,
      },
    })

    return NextResponse.json({
      success: true,
      serviceRecord: {
        id: record.id,
        date: record.date,
        assignedToId: fieldWorker.id,
      },
    })
  } catch (error) {
    console.error("Error scheduling service:", error)
    return NextResponse.json({ error: "Failed to schedule service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { serviceRecordId } = await request.json()

    if (!serviceRecordId) {
      return NextResponse.json(
        { error: "Service record ID is required." },
        { status: 400 },
      )
    }

    // Find the service record to get projector ID
    const serviceRecord = await prisma.serviceRecord.findUnique({
      where: { id: serviceRecordId },
      select: {
        id: true,
        projectorId: true,
        endTime: true,
        reportGenerated: true,
      },
    })

    if (!serviceRecord) {
      return NextResponse.json({ error: "Service record not found." }, { status: 404 })
    }

    // Only allow deletion of scheduled/in-progress services (not completed ones)
    if (serviceRecord.endTime !== null || serviceRecord.reportGenerated === true) {
      return NextResponse.json(
        { error: "Cannot delete completed service records." },
        { status: 400 },
      )
    }

    const projectorId = serviceRecord.projectorId

    // Delete the service record
    await prisma.serviceRecord.delete({
      where: { id: serviceRecordId },
    })

    // Check if there are any other scheduled/in-progress services for this projector
    const remainingScheduledServices = await prisma.serviceRecord.findFirst({
      where: {
        projectorId,
        date: null,  // Uncompleted services
      },
    })

    // If no more scheduled services, recalculate projector status based on last completed service
    if (!remainingScheduledServices) {
      // Find the last completed service
      const lastCompletedService = await prisma.serviceRecord.findFirst({
        where: {
          projectorId,
          date: { not: null },  // Completed services have date set
        },
        orderBy: { date: 'desc' },
        select: { date: true },
      })

      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      let newStatus: ServiceStatus
      let lastServiceAt: Date | null = null

      if (lastCompletedService?.date) {
        lastServiceAt = lastCompletedService.date
        newStatus = lastCompletedService.date >= sixMonthsAgo
          ? ServiceStatus.COMPLETED
          : ServiceStatus.PENDING
      } else {
        // No completed services - PENDING
        newStatus = ServiceStatus.PENDING
      }

      await prisma.projector.update({
        where: { id: projectorId },
        data: {
          status: newStatus,
          lastServiceAt,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Service record deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting service record:", error)
    return NextResponse.json({ error: "Failed to delete service record" }, { status: 500 })
  }
}

