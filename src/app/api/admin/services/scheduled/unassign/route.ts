import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { serviceRecordId } = await request.json()

    if (!serviceRecordId) {
      return NextResponse.json({ error: "serviceRecordId is required" }, { status: 400 })
    }

    const record = await prisma.serviceRecord.findUnique({
      where: { id: serviceRecordId },
      select: { id: true, assignedToId: true },
    })

    if (!record) {
      return NextResponse.json({ error: "Service record not found" }, { status: 404 })
    }

    await prisma.serviceRecord.update({
      where: { id: serviceRecordId },
      data: {
        assignedToId: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unassigning scheduled service", error)
    return NextResponse.json({ error: "Failed to unassign scheduled service" }, { status: 500 })
  }
}
