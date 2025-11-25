import { NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"


export async function GET() {
  try {
    // Fetch all field workers with their service statistics
    const fieldWorkers = await prisma.user.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    })

    // Format field workers with statistics
    const formattedWorkers = fieldWorkers.map((worker) => {
      const completedCount = worker._count.assignedServices
      const pendingCount = worker.assignedServices.filter(
        (s) =>
          s.status === ServiceStatus.PENDING ||
          s.status === ServiceStatus.SCHEDULED ||
          s.status === ServiceStatus.IN_PROGRESS,
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

