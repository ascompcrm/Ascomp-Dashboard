import { NextResponse } from "next/server"
import prisma from "@/lib/db"

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
    const now = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Get date boundaries
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // Fetch all data in parallel
    const [
      totalServiceCount,
      completedServiceCount,
      scheduledProjectorCount,
      pendingProjectorCount,
      totalProjectorCount,
      engineerCount,
      projectorsWithServices,
      recentCompleted,
      recentServiceRecords,
      allEngineers,
      inProgressCount,
      scheduledServiceCount,
    ] = await Promise.all([
      // Total service records (all time)
      prisma.serviceRecord.count(),

      // Completed services (all time) - has endTime OR reportGenerated
      prisma.projector.count(
        {
          where: {
            status: "COMPLETED",
          }
        }
      ),

      // Projectors with SCHEDULED status
      prisma.projector.count({
        where: { status: "SCHEDULED" },
      }),

      // Projectors with PENDING status (need service)
      prisma.projector.count({
        where: { status: "PENDING" },
      }),

      // Total projectors
      prisma.projector.count(),

      // Engineers count (FIELD_WORKER role only)
      prisma.user.count({
        where: { role: "FIELD_WORKER" },
      }),

      // Projectors with their latest service records (for low fL check)
      prisma.projector.findMany({
        include: {
          site: true,
          serviceRecords: {
            select: { date: true, flLeft: true, flRight: true },
            orderBy: { date: "desc" },
            take: 1,
          },
        },
      }),

      // Recent completed services
      prisma.serviceRecord.findMany({
        where: {
          OR: [
            { endTime: { not: null } },
            { reportGenerated: true },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          projector: true,
          user: true,
        },
      }),

      // Service records from last 6 months (for charts)
      prisma.serviceRecord.findMany({
        where: {
          date: { gte: last6Months },
        },
        select: {
          id: true,
          date: true,
          endTime: true,
          assignedToId: true,
          startTime: true,
          reportGenerated: true,
        },
      }),

      // All engineers with their service stats
      prisma.user.findMany({
        where: { role: "FIELD_WORKER" },
        select: {
          id: true,
          name: true,
          email: true,
          assignedServices: {
            select: {
              id: true,
              endTime: true,
              reportGenerated: true,
            },
          },
        },
      }),

      // In progress services (started but not completed)
      prisma.serviceRecord.count({
        where: {
          startTime: { not: null },
          endTime: null,
          reportGenerated: false,
        },
      }),

      // Scheduled services (not started yet)
      prisma.serviceRecord.count({
        where: {
          startTime: null,
          endTime: null,
          reportGenerated: false,
        },
      }),
    ])

    // Get pending projectors that need service (status = PENDING or not serviced in 6 months)
    const pendingProjectors = await prisma.projector.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { lastServiceAt: { lt: sixMonthsAgo } },
          { lastServiceAt: null },
        ],
      },
      include: {
        site: true,
      },
      take: 20,
      orderBy: { lastServiceAt: "asc" },
    })

    // Calculate low fL projectors (fL < 10 in last service)
    const lowFlProjectors = projectorsWithServices
      .map((projector) => {
        const lastService = projector.serviceRecords[0]
        if (!lastService) return null

        const flLeft = typeof lastService.flLeft === 'number' ? lastService.flLeft : parseFloat(String(lastService.flLeft || '0'))
        const flRight = typeof lastService.flRight === 'number' ? lastService.flRight : parseFloat(String(lastService.flRight || '0'))

        // Skip if both are 0 (no data)
        if (flLeft === 0 && flRight === 0) return null

        const avgFl = (flLeft + flRight) / 2

        if (avgFl > 0 && avgFl < 10) {
          return {
            id: projector.id,
            serialNo: projector.serialNo,
            modelNo: projector.modelNo,
            siteName: projector.site?.siteName || "Unknown",
            flLeft: flLeft.toFixed(2),
            flRight: flRight.toFixed(2),
            avgFl: avgFl.toFixed(2),
            lastServiceDate: formatDate(lastService.date),
          }
        }
        return null
      })
      .filter(Boolean)

    // Service count by day (last 7 days) - using completed services
    const servicesByDay: Record<string, number> = {}
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Initialize last 7 days in order
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayKey = dayNames[d.getDay()]
      if (dayKey) servicesByDay[dayKey] = 0
    }

    recentServiceRecords.forEach((record) => {
      if (record.date && record.date >= last7Days && (record.endTime || record.reportGenerated)) {
        const dayIndex = record.date.getDay()
        const dayKey = dayNames[dayIndex]
        if (dayKey && servicesByDay[dayKey] !== undefined) {
          servicesByDay[dayKey] = (servicesByDay[dayKey] || 0) + 1
        }
      }
    })

    const servicesByDayData = Object.entries(servicesByDay).map(([day, count]) => ({
      day,
      count,
    }))

    // Service count by month (last 6 months) - using completed services
    const servicesByMonth: Record<string, number> = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Initialize last 6 months in order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = monthNames[d.getMonth()]
      if (monthKey) servicesByMonth[monthKey] = 0
    }

    recentServiceRecords.forEach((record) => {
      if (record.date && (record.endTime || record.reportGenerated)) {
        const monthIndex = record.date.getMonth()
        const monthKey = monthNames[monthIndex]
        if (monthKey && servicesByMonth[monthKey] !== undefined) {
          servicesByMonth[monthKey] = (servicesByMonth[monthKey] || 0) + 1
        }
      }
    })

    const servicesByMonthData = Object.entries(servicesByMonth).map(([month, count]) => ({
      month,
      count,
    }))

    // Engineer stats - using assignedServices relation
    const engineerStats = allEngineers.map((engineer) => {
      const completed = engineer.assignedServices.filter(
        (s) => s.endTime !== null || s.reportGenerated === true
      ).length
      const pending = engineer.assignedServices.filter(
        (s) => s.endTime === null && s.reportGenerated !== true
      ).length

      return {
        id: engineer.id,
        name: engineer.name || engineer.email?.split("@")[0] || "Unknown",
        completed,
        pending,
        total: completed + pending,
      }
    }).filter((e) => e.total > 0)
      .sort((a, b) => b.total - a.total) // Sort by most services

    // Format recent records
    const recent = recentCompleted.map((r) => ({
      id: r.id,
      serviceNumber: r.serviceNumber ?? null,
      cinemaName: r.cinemaName ?? r.address ?? null,
      siteId: r.siteId,
      projectorSerial: r.projector?.serialNo ?? null,
      projectorModel: r.projector?.modelNo ?? null,
      engineer: r.user?.name ?? r.user?.email ?? null,
      status: r.endTime ? "Completed" : r.startTime ? "In Progress" : "Scheduled",
      date: formatDate(r.endTime ?? r.date ?? r.createdAt),
    }))

    return NextResponse.json({
      totals: {
        all: totalServiceCount,
        completed: completedServiceCount,
        scheduled: scheduledProjectorCount,
        pending: pendingProjectorCount,
        projectors: totalProjectorCount,
        engineers: engineerCount,
      },
      serviceStatusBreakdown: [
        { name: "Completed", value: completedServiceCount, fill: "#22c55e" },
        { name: "In Progress", value: inProgressCount, fill: "#eab308" },
        { name: "Scheduled", value: scheduledServiceCount, fill: "#3b82f6" },
      ],
      servicesByDay: servicesByDayData,
      servicesByMonth: servicesByMonthData,
      lowFlProjectors,
      pendingProjectors: pendingProjectors.map((p) => ({
        id: p.id,
        serialNo: p.serialNo,
        modelNo: p.modelNo,
        status: p.status,
        siteName: p.site?.siteName || "Unknown",
        lastServiceDate: formatDate(p.lastServiceAt),
      })),
      engineerStats,
      recent,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
