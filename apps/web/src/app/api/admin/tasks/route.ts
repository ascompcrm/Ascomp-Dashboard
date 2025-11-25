import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get("timeRange") || "all" // all, 24h, 7d, 30d
    const statusFilter = searchParams.get("status") || "all" // all, pending, scheduled, in_progress, completed

    // Calculate date range based on time filter
    let dateFilter: { gte?: Date } | undefined = undefined
    const now = new Date()

    switch (timeRange) {
      case "24h":
        dateFilter = { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        break
      case "7d":
        dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        break
      case "30d":
        dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        break
      default:
        dateFilter = undefined
    }

    // Build status filter
    let statusWhere: { in?: ServiceStatus[] } | undefined = undefined
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "pending":
          statusWhere = { in: [ServiceStatus.PENDING] }
          break
        case "scheduled":
          statusWhere = { in: [ServiceStatus.SCHEDULED] }
          break
        case "in_progress":
          statusWhere = { in: [ServiceStatus.IN_PROGRESS] }
          break
        case "completed":
          statusWhere = { in: [ServiceStatus.COMPLETED] }
          break
        default:
          statusWhere = undefined
      }
    }

    // Build where clause
    const whereClause: any = {}
    if (dateFilter) {
      whereClause.date = dateFilter
    }
    if (statusWhere) {
      whereClause.status = statusWhere
    }

    // Fetch tasks with filters
    const tasks = await prisma.serviceRecord.findMany({
      where: whereClause,
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
    })

    // Format tasks
    const formattedTasks = tasks.map((task) => {
      let status: "pending" | "scheduled" | "in_progress" | "completed" = "pending"
      if (task.status === ServiceStatus.COMPLETED) {
        status = "completed"
      } else if (task.status === ServiceStatus.IN_PROGRESS) {
        status = "in_progress"
      } else if (task.status === ServiceStatus.SCHEDULED) {
        status = "scheduled"
      } else if (task.status === ServiceStatus.PENDING) {
        status = "pending"
      }

      return {
        id: task.id,
        projectorId: task.projectorId,
        siteId: task.siteId,
        fieldWorkerId: task.assignedToId || "",
        scheduledDate: task.date?.toISOString().split("T")[0] || "",
        status,
        projectorName: `${task.projector.projectorModel} (${task.projector.serialNo})`,
        workerName: task.assignedTo?.name || "Unassigned",
        siteName: task.projector.site.siteName,
        rawStatus: task.status,
      }
    })

    return NextResponse.json({
      tasks: formattedTasks,
      count: formattedTasks.length,
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

