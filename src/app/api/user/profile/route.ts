import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
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
        phoneNumber: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get completed services count (those with endTime or reportGenerated)
    const completedCount = await prisma.serviceRecord.count({
      where: {
        assignedToId: userId,
        OR: [
          { endTime: { not: null } },
          { reportGenerated: true },
        ],
      },
    })

    // Get pending/scheduled/in-progress count (those without endTime and reportGenerated)
    const activeCount = await prisma.serviceRecord.count({
      where: {
        assignedToId: userId,
        AND: [
          { endTime: null },
          { reportGenerated: false },
        ],
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
        OR: [
          { endTime: { not: null } },
          { reportGenerated: true },
        ],
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
        OR: [
          { endTime: { not: null } },
          { reportGenerated: true },
        ],
      },
      select: {
        projectorId: true,
      },
      distinct: ['projectorId'],
    })

    // Get last service date (from most recently completed service)
    // Order by endTime desc (most accurate completion date), nulls will be last
    const lastService = await prisma.serviceRecord.findFirst({
      where: {
        assignedToId: userId,
        OR: [
          { endTime: { not: null } },
          { reportGenerated: true },
        ],
      },
      orderBy: {
        endTime: 'desc',
      },
      select: {
        endTime: true,
        date: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinDate: user.createdAt.toISOString(),
        image: user.image,
        phoneNumber: user.phoneNumber,
      },
      stats: {
        totalServices,
        completedServices: completedCount,
        activeServices: activeCount,
        uniqueSites: uniqueSites.length,
        uniqueProjectors: uniqueProjectors.length,
        lastServiceDate: lastService?.endTime?.toISOString() || 
                         lastService?.date?.toISOString() || 
                         lastService?.createdAt?.toISOString() || 
                         null,
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

