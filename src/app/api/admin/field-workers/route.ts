import { NextResponse } from "next/server"
import prisma from "@/lib/db"


export async function GET() {
  try {
    // Fetch all field workers with their service statistics
    const fieldWorkers = await prisma.user.findMany({
      include: {
        assignedServices: {
          select: {
            id: true,
            endTime: true,
            reportGenerated: true,
            date: true,
          },
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Format field workers with statistics
    const formattedWorkers = fieldWorkers.map((worker) => {
      // All service records are completed, but filter by completion indicators
      const completedCount = worker.assignedServices.filter(
        (s) => s.endTime !== null || s.reportGenerated === true,
      ).length
      // Pending are those without endTime and reportGenerated
      const pendingCount = worker.assignedServices.filter(
        (s) => s.endTime === null && s.reportGenerated === false,
      ).length
      const lastService = worker.assignedServices[0]

      return {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        joinDate: worker.createdAt.toISOString().split("T")[0],
        lastActiveDate: lastService?.date?.toISOString().split("T")[0] || worker.createdAt.toISOString().split("T")[0],
        sitesCompleted: completedCount,
        pendingTasks: pendingCount,
        totalTasks: worker.assignedServices.length,
      }
    })

    return NextResponse.json({
      workers: formattedWorkers,
      count: formattedWorkers.length,
    })
  } catch (error) {
    console.error("Error fetching field workers:", error)
    return NextResponse.json({ error: "Failed to fetch field workers" }, { status: 500 })
  }
}

