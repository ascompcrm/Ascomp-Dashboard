import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ serviceId: string }> }
) {
    try {
        const { serviceId } = await context.params

        // Fetch only the necessary fields for public image viewing
        const service = await prisma.serviceRecord.findUnique({
            where: { id: serviceId },
            select: {
                id: true,
                images: true,
                afterImages: true,
                brokenImages: true,
                serviceNumber: true,
                date: true,
                cinemaName: true,
                site: {
                    select: {
                        siteName: true,
                    },
                },
            },
        })

        if (!service) {
            return NextResponse.json({ error: "Service record not found" }, { status: 404 })
        }

        // Return only public-safe data
        return NextResponse.json({
            service: {
                id: service.id,
                images: service.images || [],
                afterImages: service.afterImages || [],
                brokenImages: service.brokenImages || [],
                serviceNumber: service.serviceNumber,
                date: service.date?.toISOString() || null,
                cinemaName: service.cinemaName || service.site?.siteName || "Unknown",
            },
        })
    } catch (error) {
        console.error("Error fetching public service images:", error)
        return NextResponse.json({ error: "Failed to fetch service images" }, { status: 500 })
    }
}
