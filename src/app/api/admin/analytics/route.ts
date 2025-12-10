import { NextResponse } from "next/server"
import prisma from "@/lib/db"

const deriveStatus = (record: { reportGenerated: boolean; startTime: Date | null; endTime: Date | null }) => {
  if (record.endTime) return "Completed"
  if (record.startTime && !record.endTime) return "In Progress"
  if (!record.startTime && !record.endTime && record.reportGenerated === false) return "Scheduled"
  return "Pending"
}

const formatDate = (value: Date | null | undefined) => {
  if (!value) return null
  try {
    return value.toISOString().split("T")[0]
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const [allCount, scheduledCount, projectorsWithServices, recentCompleted] = await Promise.all([
      prisma.serviceRecord.count(),
      prisma.projector.count({
        where: {
          status: "SCHEDULED",
        },
      }),
      prisma.projector.findMany({
        include: {
          serviceRecords: {
            select: { date: true },
            orderBy: { date: "desc" }, // latest service record first
          },
        },
      }),
      prisma.serviceRecord.findMany({
        where: {
          endTime: { not: null }, // completed records
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          projector: true,
          user: true,
        },
      }),
    ])

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const pendingProjectors = projectorsWithServices
      .map((projector) => {
        const latestServiceDate = projector.serviceRecords[0]?.date
        const isPending = !latestServiceDate || latestServiceDate < sixMonthsAgo
        return isPending
          ? {
              id: projector.id,
              serialNo: projector.serialNo,
              modelNo: projector.modelNo,
              status: projector.status,
              lastServiceDate: latestServiceDate ?? null,
            }
          : null
      })
      .filter(Boolean) as {
      id: string
      serialNo: string
      modelNo: string
      status: string
      lastServiceDate: Date | null
    }[]

    const pendingCount = pendingProjectors.length

    const recent = recentCompleted.map((r) => ({
      id: r.id,
      serviceNumber: r.serviceNumber ?? null,
      cinemaName: r.cinemaName ?? r.address ?? null,
      siteId: r.siteId,
      projectorSerial: r.projector?.serialNo ?? null,
      projectorModel: r.projector?.modelNo ?? null,
      engineer: r.user?.email ?? r.user?.name ?? null,
      status: deriveStatus(r),
      date: formatDate(r.endTime ?? r.date ?? r.createdAt),
    }))

    return NextResponse.json({
      totals: {
        all: allCount,
        scheduled: scheduledCount,
        pending: pendingCount,
      },
      pendingProjectors: pendingProjectors.slice(0, 10).map((p) => ({
        ...p,
        lastServiceDate: formatDate(p.lastServiceDate),
      })),
      recent,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

