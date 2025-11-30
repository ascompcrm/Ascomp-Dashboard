import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from cookies using better-auth
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch scheduled and in-progress services assigned to this user
    // These are service records that aren't fully completed yet (no endTime or reportGenerated)
    const services = await prisma.serviceRecord.findMany({
      where: {
        assignedToId: userId,
        AND: [
          { endTime: null },
          { reportGenerated: false },
        ],
      },
      include: {
        site: {
          select: {
            id: true,
            siteName: true,
            address: true,
            contactDetails: true,
          },
        },
        projector: {
          select: {
            id: true,
            modelNo: true,
            serialNo: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Format services for the frontend
    const formattedServices = services.map((service) => {
      const serviceDate = service.date ? new Date(service.date) : null
      const formattedDate = serviceDate
        ? `${String(serviceDate.getDate()).padStart(2, "0")}/${String(serviceDate.getMonth() + 1).padStart(2, "0")}/${serviceDate.getFullYear()}`
        : "Not scheduled"

      return {
        id: service.id,
        serviceNumber: service.serviceNumber,
        site: service.site.siteName,
        siteId: service.site.id,
        address: service.site.address,
        contactDetails: service.site.contactDetails,
        projector: service.projector.serialNo,
        projectorId: service.projector.id,
        projectorModel: service.projector.modelNo,
        type: service.startTime !== null ? "In Progress" : "Scheduled Maintenance",
        date: formattedDate,
        rawDate: service.date?.toISOString() || null,
        status: service.startTime !== null ? "in_progress" : "scheduled",
      }
    })

    return NextResponse.json({
      services: formattedServices,
      count: formattedServices.length,
    })
  } catch (error) {
    console.error("Error fetching user services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

