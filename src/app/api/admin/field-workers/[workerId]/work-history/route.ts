import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ workerId: string }> }
) {
  try {
    const { workerId } = await context.params

    // Fetch field worker details
    const worker = await prisma.user.findUnique({
      where: {
        id: workerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
      },
    })

    if (!worker || worker.role !== "FIELD_WORKER") {
      return NextResponse.json({ error: "Field worker not found" }, { status: 404 })
    }

    // Fetch all service records assigned to this worker
    const serviceRecords = await prisma.serviceRecord.findMany({
      where: {
        assignedToId: workerId,
      },
      include: {
        site: {
          select: {
            id: true,
            siteName: true,
            address: true,
          },
        },
        projector: {
          select: {
            id: true,
            modelNo: true,
            serialNo: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Format work history
    const workHistory = serviceRecords.map((record) => {
      // Determine status based on completion indicators
      const isCompleted = record.endTime !== null || record.reportGenerated === true
      const isInProgress = record.startTime !== null && record.endTime === null
      const status = isCompleted ? "completed" : isInProgress ? "in_progress" : "scheduled"
      
      return {
        id: record.id,
        serviceNumber: record.serviceNumber,
        status,
        date: record.date?.toISOString().split("T")[0] || null,
      startTime: record.startTime?.toISOString() || null,
      endTime: record.endTime?.toISOString() || null,
      site: {
        id: record.site.id,
        name: record.site.siteName,
        address: record.site.address,
      },
      projector: {
        id: record.projector.id,
        model: record.projector.modelNo,
        serialNo: record.projector.serialNo,
      },
      projectorRunningHours: record.projectorRunningHours,
      remarks: record.remarks,
      reportGenerated: record.reportGenerated,
      reportUrl: record.reportUrl,
      }
    })

    // Calculate statistics
    const completedCount = serviceRecords.filter(
      (r) => r.endTime !== null || r.reportGenerated === true,
    ).length
    const pendingCount = serviceRecords.filter(
      (r) => r.endTime === null && r.reportGenerated === false,
    ).length
    const inProgressCount = serviceRecords.filter(
      (r) => r.startTime !== null && r.endTime === null,
    ).length

    // Get unique sites worked on
    const uniqueSites = Array.from(
      new Map(serviceRecords.map((r) => [r.site.id, r.site])).values(),
    )

    return NextResponse.json({
      worker: {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        joinDate: worker.createdAt.toISOString().split("T")[0],
      },
      statistics: {
        totalServices: serviceRecords.length,
        completed: completedCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        sitesWorked: uniqueSites.length,
      },
      workHistory,
      sitesWorked: uniqueSites.map((site) => ({
        id: site.id,
        name: site.siteName,
        address: site.address,
      })),
    })
  } catch (error) {
    console.error("Error fetching field worker work history:", error)
    return NextResponse.json({ error: "Failed to fetch work history" }, { status: 500 })
  }
}

