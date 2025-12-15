import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const filterType = searchParams.get("filter") || "today" // today, 7days, month, custom
        const customDate = searchParams.get("date") // YYYY-MM-DD format for custom date

        const now = new Date()
        let startDate: Date
        let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

        switch (filterType) {
            case "7days":
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                startDate.setHours(0, 0, 0, 0)
                break
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
                startDate.setHours(0, 0, 0, 0)
                break
            case "custom":
                if (customDate) {
                    startDate = new Date(customDate)
                    startDate.setHours(0, 0, 0, 0)
                    endDate = new Date(customDate)
                    endDate.setHours(23, 59, 59, 999)
                } else {
                    // Default to today if no custom date provided
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
                }
                break
            case "today":
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
                break
        }

        // Get all engineers with their assigned services within date range
        const engineers = await prisma.user.findMany({
            where: { role: "FIELD_WORKER" },
            select: {
                id: true,
                name: true,
                email: true,
                assignedServices: {
                    where: {
                        date: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    select: {
                        id: true,
                        date: true,
                        endTime: true,
                        reportGenerated: true,
                        createdAt: true,
                    },
                },
            },
        })

        // Calculate pending based on the user's logic:
        // A task is pending if it was assigned and more than 1 day has passed without completion
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        const engineerStats = engineers.map((engineer) => {
            // Completed: services where endTime is set OR reportGenerated is true
            const completed = engineer.assignedServices.filter(
                (s) => s.endTime !== null || s.reportGenerated === true
            ).length

            // Pending: services that are not completed AND were created/scheduled more than 1 day ago
            const pending = engineer.assignedServices.filter((s) => {
                const isNotCompleted = s.endTime === null && s.reportGenerated !== true
                const assignedDate = s.date || s.createdAt
                const isOverdue = assignedDate < oneDayAgo
                return isNotCompleted && isOverdue
            }).length

            // In Progress: services that are not completed but not yet overdue (within 1 day)
            const inProgress = engineer.assignedServices.filter((s) => {
                const isNotCompleted = s.endTime === null && s.reportGenerated !== true
                const assignedDate = s.date || s.createdAt
                const isNotOverdue = assignedDate >= oneDayAgo
                return isNotCompleted && isNotOverdue
            }).length

            return {
                id: engineer.id,
                name: engineer.name || engineer.email?.split("@")[0] || "Unknown",
                email: engineer.email,
                completed,
                pending,
                inProgress,
                total: engineer.assignedServices.length,
            }
        })
            .filter((e) => e.total > 0) // Only show engineers with assigned services in the date range
            .sort((a, b) => b.total - a.total) // Sort by most services

        // Summary totals
        const totals = {
            engineers: engineers.length,
            totalAssigned: engineerStats.reduce((acc, e) => acc + e.total, 0),
            totalCompleted: engineerStats.reduce((acc, e) => acc + e.completed, 0),
            totalPending: engineerStats.reduce((acc, e) => acc + e.pending, 0),
            totalInProgress: engineerStats.reduce((acc, e) => acc + e.inProgress, 0),
        }

        return NextResponse.json({
            filter: filterType,
            dateRange: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
            },
            totals,
            engineers: engineerStats,
        })
    } catch (error) {
        console.error("Error fetching engineer stats:", error)
        return NextResponse.json({ error: "Failed to fetch engineer stats" }, { status: 500 })
    }
}
