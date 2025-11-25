import { NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@my-better-t-app/db"

export async function GET() {
  try {
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch data in parallel with optimized queries
    const [
      totalSites,
      totalProjectors,
      pendingProjectorsCount,
      completedProjectorsCount,
      scheduledServicesCount,
      pendingProjectors,
      fieldWorkers,
      recentTasks,
    ] = await Promise.all([
      // Count total sites
      prisma.site.count(),

      // Count total projectors
      prisma.projector.count(),

      // Count pending projectors (no service or service > 6 months ago)
      prisma.projector.count({
        where: {
          OR: [
            { lastServiceAt: null },
            { lastServiceAt: { lt: sixMonthsAgo } },
          ],
        },
      }),

      // Count completed projectors (service within 6 months)
      prisma.projector.count({
        where: {
          lastServiceAt: { gte: sixMonthsAgo },
        },
      }),

      // Count scheduled services
      prisma.serviceRecord.count({
        where: {
          status: {
            in: [ServiceStatus.SCHEDULED, ServiceStatus.IN_PROGRESS],
          },
        },
      }),

      // Get top 5 pending projectors with site info
      prisma.projector.findMany({
        where: {
          OR: [
            { lastServiceAt: null },
            { lastServiceAt: { lt: sixMonthsAgo } },
          ],
        },
        include: {
          site: {
            select: {
              id: true,
              siteName: true,
            },
          },
        },
        orderBy: {
          lastServiceAt: "asc",
        },
        take: 5,
      }),

      // Get field workers with their service counts
      prisma.user.findMany({
        where: {
          role: "FIELD_WORKER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          assignedServices: {
            select: {
              id: true,
              status: true,
              date: true,
            },
            orderBy: {
              date: "desc",
            },
            take: 1,
          },
          _count: {
            select: {
              assignedServices: {
                where: {
                  status: ServiceStatus.COMPLETED,
                },
              },
            },
          },
        },
      }),

      // Get recent scheduled tasks
      prisma.serviceRecord.findMany({
        where: {
          status: {
            in: [ServiceStatus.SCHEDULED, ServiceStatus.IN_PROGRESS],
          },
        },
        include: {
          projector: {
            include: {
              site: {
                select: {
                  siteName: true,
                },
              },
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 4,
      }),
    ])

    // Calculate active workers (active in last 7 days)
    const activeWorkers = fieldWorkers.filter((fw) => {
      const lastService = fw.assignedServices[0]
      if (!lastService?.date) return false
      return lastService.date >= sevenDaysAgo
    })

    // Format pending projectors
    const pendingProjectorsWithSite = pendingProjectors.map((p) => ({
      id: p.id,
      name: `${p.projectorModel} (${p.serialNo})`,
      siteName: p.site.siteName,
      siteId: p.siteId,
      lastServiceAt: p.lastServiceAt?.toISOString().split("T")[0] || null,
      nextServiceAt: p.nextServiceAt?.toISOString().split("T")[0] || null,
    }))

    const recentWorkers = fieldWorkers
      .map((fw) => {
        const lastService = fw.assignedServices[0]
        const completedCount = fw.assignedServices.filter(
          (s) => s.status === ServiceStatus.COMPLETED,
        ).length
        const pendingCount = fw.assignedServices.filter(
          (s) => s.status === ServiceStatus.PENDING || s.status === ServiceStatus.SCHEDULED || s.status === ServiceStatus.IN_PROGRESS,
        ).length

        return {
          id: fw.id,
          name: fw.name,
          email: fw.email,
          sitesCompleted: completedCount,
          pendingTasks: pendingCount,
          totalTasks: fw.assignedServices.length,
          lastActiveDate:
            lastService?.date?.toISOString().split("T")[0] || fw.createdAt.toISOString().split("T")[0],
          joinDate: fw.createdAt.toISOString().split("T")[0],
        }
      })
      .sort((a, b) => new Date(b.lastActiveDate || "").getTime() - new Date(a.lastActiveDate || "").getTime())
      .slice(0, 4)

    // Format recent tasks
    const formattedRecentTasks = recentTasks.map((task) => ({
      id: task.id,
      projectorId: task.projectorId,
      siteId: task.siteId,
      fieldWorkerId: task.assignedToId || "",
      scheduledDate: task.date?.toISOString().split("T")[0] || "",
      status: task.status === ServiceStatus.COMPLETED ? "completed" : "pending",
      projectorName: `${task.projector.projectorModel} (${task.projector.serialNo})`,
      workerName: task.assignedTo?.name || "Unassigned",
      siteName: task.projector.site.siteName,
    }))

    return NextResponse.json({
      stats: {
        totalSites,
        totalProjectors,
        fieldWorkers: fieldWorkers.length,
        pendingServices: pendingProjectorsCount,
        completedServices: completedProjectorsCount,
        scheduledServices: scheduledServicesCount,
        activeWorkers: activeWorkers.length,
      },
      pendingProjectors: pendingProjectorsWithSite,
      recentWorkers,
      recentTasks: formattedRecentTasks,
    })
  } catch (error) {
    console.error("Error fetching overview data:", error)
    return NextResponse.json({ error: "Failed to fetch overview data" }, { status: 500 })
  }
}

