import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get completed services count
    const completedCount = await prisma.serviceRecord.count({
      where: {
        assignedToId: userId,
        status: ServiceStatus.COMPLETED,
      },
    })

    // Get pending/scheduled/in-progress count
    const activeCount = await prisma.serviceRecord.count({
      where: {
        assignedToId: userId,
        status: {
          in: [ServiceStatus.SCHEDULED, ServiceStatus.IN_PROGRESS, ServiceStatus.PENDING],
        },
      },
    })

    // Get total services
    const totalServices = await prisma.serviceRecord.count({
      where: {
        assignedToId: userId,
      },
    })

    // Get unique sites worked on
    const uniqueSites = await prisma.serviceRecord.findMany({
      where: {
        assignedToId: userId,
        status: ServiceStatus.COMPLETED,
      },
      select: {
        siteId: true,
      },
      distinct: ['siteId'],
    })

    // Get unique projectors worked on
    const uniqueProjectors = await prisma.serviceRecord.findMany({
      where: {
        assignedToId: userId,
        status: ServiceStatus.COMPLETED,
      },
      select: {
        projectorId: true,
      },
      distinct: ['projectorId'],
    })

    // Get last service date
    const lastService = await prisma.serviceRecord.findFirst({
      where: {
        assignedToId: userId,
        status: ServiceStatus.COMPLETED,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        updatedAt: true,
        date: true,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinDate: user.createdAt,
        image: user.image,
      },
      stats: {
        totalServices,
        completedServices: completedCount,
        activeServices: activeCount,
        uniqueSites: uniqueSites.length,
        uniqueProjectors: uniqueProjectors.length,
        lastServiceDate: lastService?.updatedAt || lastService?.date || null,
      },
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    )
  }
}

