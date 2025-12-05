import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get("timeRange") || "all" // all, 24h, 7d, 30d, custom
    const statusFilter = searchParams.get("status") || "all" // all, completed
    const workerId = searchParams.get("workerId") || null // Filter by specific field worker
    const startDate = searchParams.get("startDate") || null // Custom start date
    const endDate = searchParams.get("endDate") || null // Custom end date
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Calculate date range based on time filter or custom dates
    let dateFilter: { gte?: Date; lte?: Date } | undefined = undefined
    const now = new Date()

    if (timeRange === "custom" && (startDate || endDate)) {
      // Custom date range
      dateFilter = {}
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        dateFilter.gte = start
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        dateFilter.lte = end
      }
    } else {
      // Predefined time ranges
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
    }

    // Build where clause
    // Filter by projector.status from the Projector model
    const whereClause: any = {}
    const andConditions: any[] = []
    
    if (statusFilter === "completed") {
      // Filter by projector status COMPLETED
      andConditions.push({
        projector: {
          status: ServiceStatus.COMPLETED,
        },
      })
    } else if (statusFilter === "scheduled") {
      // Filter by projector status SCHEDULED
      andConditions.push({
        projector: {
          status: ServiceStatus.SCHEDULED,
        },
      })
    } else if (statusFilter === "pending") {
      // For pending, we no longer rely solely on projector.status.
      // We'll determine \"pending\" based on last service date (> 6 months ago) later in code.
    } else if (statusFilter === "in_progress") {
      // Filter by projector status IN_PROGRESS
      andConditions.push({
        projector: {
          status: ServiceStatus.IN_PROGRESS,
        },
      })
    }
    
    // Handle date filter
    if (dateFilter) {
      if (statusFilter === "completed") {
        // For completed services, filter by endTime or createdAt
        if (dateFilter.gte && dateFilter.lte) {
          // Custom date range with both start and end
          andConditions.push({
            OR: [
              {
                AND: [
                  { endTime: { not: null } },
                  { endTime: { gte: dateFilter.gte, lte: dateFilter.lte } },
                ],
              },
              {
                AND: [
                  { endTime: null },
                  { reportGenerated: true },
                  { createdAt: { gte: dateFilter.gte, lte: dateFilter.lte } },
                ],
              },
            ],
          })
        } else if (dateFilter.gte) {
          // Only start date (gte)
          andConditions.push({
            OR: [
              {
                AND: [
                  { endTime: { not: null } },
                  { endTime: { gte: dateFilter.gte } },
                ],
              },
              {
                AND: [
                  { endTime: null },
                  { reportGenerated: true },
                  { createdAt: { gte: dateFilter.gte } },
                ],
              },
            ],
          })
        } else if (dateFilter.lte) {
          // Only end date (lte)
          andConditions.push({
            OR: [
              {
                AND: [
                  { endTime: { not: null } },
                  { endTime: { lte: dateFilter.lte } },
                ],
              },
              {
                AND: [
                  { endTime: null },
                  { reportGenerated: true },
                  { createdAt: { lte: dateFilter.lte } },
                ],
              },
            ],
          })
        }
      } else {
        // For other statuses (scheduled, pending, in_progress, all), filter by date field (scheduled date)
        andConditions.push({ date: dateFilter })
      }
    }
    
    // Add worker filter if provided
    if (workerId) {
      andConditions.push({ assignedToId: workerId })
    }
    
    if (andConditions.length > 0) {
      whereClause.AND = andConditions
    }

    // Get total count for pagination
    const totalCount = await prisma.serviceRecord.count({
      where: whereClause,
    })

    // Fetch tasks with filters and pagination
    const tasks = await prisma.serviceRecord.findMany({
      where: whereClause,
      include: {
        projector: {
          include: {
            site: {
              select: {
                siteName: true,
                address: true,
                siteCode: true,
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
      orderBy: statusFilter === "completed" 
        ? { endTime: "desc" } // For completed services, order by endTime (completion time)
        : { date: "desc" }, // For other statuses, order by scheduled date
      skip: skip,
      take: limit,
    })

    // Get last service record's screenNumber (Audi Number), address and date for each projector
    const projectorIds = [...new Set(tasks.map(task => task.projectorId))]
    const lastServiceRecords = await prisma.serviceRecord.findMany({
      where: {
        projectorId: { in: projectorIds },
        OR: [
          { screenNumber: { not: null } },
          { address: { not: null } },
        ],
      },
      select: {
        projectorId: true,
        screenNumber: true,
        address: true,
        date: true,
        endTime: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Create maps of projectorId -> last screenNumber and address (most recent by createdAt)
    const projectorScreenNumberMap = new Map<string, string>()
    const projectorAddressMap = new Map<string, string>()
    const projectorLastServiceDateMap = new Map<string, string>()
    for (const record of lastServiceRecords) {
      if (!projectorScreenNumberMap.has(record.projectorId) && record.screenNumber) {
        projectorScreenNumberMap.set(record.projectorId, record.screenNumber)
      }
      if (!projectorAddressMap.has(record.projectorId) && record.address) {
        projectorAddressMap.set(record.projectorId, record.address)
      }
      if (!projectorLastServiceDateMap.has(record.projectorId)) {
        const baseDate = record.date || record.endTime || record.createdAt
        if (baseDate) {
          projectorLastServiceDateMap.set(record.projectorId, baseDate.toISOString())
        }
      }
    }

    // Format tasks
    // Determine status based on projector.status from the Projector model
    const sixMonthsAgo = (() => {
      const d = new Date()
      d.setMonth(d.getMonth() - 6)
      return d
    })()

    const formattedTasks = tasks.map((task) => {
      // Map projector.status enum to frontend status string
      let status: "pending" | "scheduled" | "in_progress" | "completed" = "pending"
      const projectorStatus = task.projector.status
      
      switch (projectorStatus) {
        case ServiceStatus.COMPLETED:
          status = "completed"
          break
        case ServiceStatus.SCHEDULED:
          status = "scheduled"
          break
        case ServiceStatus.IN_PROGRESS:
          status = "in_progress"
          break
        case ServiceStatus.PENDING:
          status = "pending"
          break
        default:
          status = "pending"
      }

      const isCompleted = status === "completed"

      // Determine last service date for this projector (ServiceRecord.date)
      const lastServiceIso = projectorLastServiceDateMap.get(task.projectorId) || ""
      const lastServiceDate = lastServiceIso ? new Date(lastServiceIso) : null
      const isOverdue =
        lastServiceDate && !Number.isNaN(lastServiceDate.getTime())
          ? lastServiceDate < sixMonthsAgo
          : false

      // For \"pending\" filter, only keep projectors whose last service was more than 6 months ago
      if (statusFilter === "pending" && !isOverdue) {
        return null
      }

      return {
        id: task.id,
        projectorId: task.projectorId,
        siteId: task.siteId,
        fieldWorkerId: task.assignedToId || "",
        scheduledDate: task.date?.toISOString().split("T")[0] || "",
        completedAt: isCompleted 
          ? (task.endTime?.toISOString() || task.createdAt?.toISOString() || "")
          : "",
        status,
        projectorName: `${(task.projector as any).projectorModel || (task.projector as any).modelNo} (${task.projector.serialNo})`,
        workerName: task.assignedTo?.name || "Unassigned",
        siteName: task.projector.site.siteName,
        siteAddress: projectorAddressMap.get(task.projectorId) || task.projector.site.address || "", // Address from last service record, fallback to site address
        siteCode: task.projector.site.siteCode || "",
        screenNumber: projectorScreenNumberMap.get(task.projectorId) || "", // Audi Number from last service record
        lastServiceDate: lastServiceIso, // Last serviced date (ServiceRecord.date)
        reportGenerated: task.reportGenerated,
        reportUrl: task.reportUrl || null,
        serviceNumber: task.serviceNumber,
      }
    }).filter((t) => t !== null)

    // For scheduled view we only want the latest scheduled service per projector,
    // not every historical record. Deduplicate by projectorId, keeping the newest date.
    let finalTasks = formattedTasks
    if (statusFilter === "scheduled") {
      const byProjector = new Map<string, (typeof formattedTasks)[number]>()
      for (const t of formattedTasks) {
        if (!t) continue
        const existing = byProjector.get(t.projectorId)
        if (!existing) {
          byProjector.set(t.projectorId, t)
        } else {
          const tTime = t.scheduledDate ? new Date(t.scheduledDate).getTime() : 0
          const eTime = existing.scheduledDate ? new Date(existing.scheduledDate).getTime() : 0
          if (tTime > eTime) {
            byProjector.set(t.projectorId, t)
          }
        }
      }
      finalTasks = Array.from(byProjector.values())
    }

    return NextResponse.json({
      tasks: finalTasks,
      count: finalTasks.length,
      totalCount: totalCount,
      page: page,
      limit: limit,
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

