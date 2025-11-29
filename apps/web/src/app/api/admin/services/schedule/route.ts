import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"

// Helper to generate Mongo-style IDs (since schema uses string IDs)
const generateObjectId = () => [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join("")

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

    const nextServiceNumber = await prisma.serviceRecord.count({
      where: { projectorId },
    })

    const record = await prisma.serviceRecord.create({
      data: {
        id: generateObjectId(),
        userId: admin.id,
        assignedToId: fieldWorker.id,
        projectorId: projector.id,
        siteId: site.id,
        serviceNumber: String(nextServiceNumber + 1),
        status: ServiceStatus.SCHEDULED,
        date: parsedDate,
        cinemaName: site.siteName,
        address: site.address,
        contactDetails: site.contactDetails,
        location: site.address,
        screenNumber: site.screenNo,
        projectorRunningHours: projector.runningHours ?? 0,
        remarks: "Scheduled via admin panel",
      },
    })

    return NextResponse.json({
      success: true,
      serviceRecord: {
        id: record.id,
        status: record.status,
        date: record.date,
        assignedToId: fieldWorker.id,
      },
    })
  } catch (error) {
    console.error("Error scheduling service:", error)
    return NextResponse.json({ error: "Failed to schedule service" }, { status: 500 })
  }
}

