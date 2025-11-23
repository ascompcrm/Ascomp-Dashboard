import { NextRequest, NextResponse } from "next/server"
import prisma from "@my-better-t-app/db"

// Helper function to generate MongoDB-style ObjectId
function generateObjectId(): string {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
}

export async function POST(request: NextRequest) {
  try {
    const { siteId, projectorModel, serialNo, runningHours } = await request.json()

    if (!siteId || !projectorModel || !serialNo) {
      return NextResponse.json(
        { error: "Site ID, projector model, and serial number are required" },
        { status: 400 },
      )
    }

    // Check if projector with same serial number already exists
    const existingProjector = await prisma.projector.findUnique({
      where: { serialNo },
    })

    if (existingProjector) {
      return NextResponse.json(
        { error: "Projector with this serial number already exists" },
        { status: 400 },
      )
    }

    // Verify site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Set next service date to 6 months from now
    const nextServiceAt = new Date()
    nextServiceAt.setMonth(nextServiceAt.getMonth() + 6)

    const projector = await prisma.projector.create({
      data: {
        id: generateObjectId(),
        projectorModel,
        serialNo,
        siteId,
        runningHours: runningHours ? parseInt(runningHours) : null,
        nextServiceAt,
      },
      include: {
        site: {
          select: {
            id: true,
            siteName: true,
            address: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      projector: {
        id: projector.id,
        name: `${projector.projectorModel} (${projector.serialNo})`,
        model: projector.projectorModel,
        serialNumber: projector.serialNo,
        installDate: new Date().toISOString().split("T")[0],
        lastServiceDate: null,
        status: "pending" as const,
        nextServiceDue: projector.nextServiceAt?.toISOString().split("T")[0] || null,
      },
    })
  } catch (error) {
    console.error("Error creating projector:", error)
    return NextResponse.json({ error: "Failed to create projector" }, { status: 500 })
  }
}

