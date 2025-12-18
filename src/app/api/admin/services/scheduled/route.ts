import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").toLowerCase().trim()

    const projectors = await prisma.projector.findMany({
      where: {
        status: ServiceStatus.SCHEDULED,
      },
      include: {
        site: {
          select: {
            siteName: true,
            address: true,
          },
        },
        serviceRecords: {
          where: {
            OR: [
              { endTime: null },
            ],
          },
          include: {
            assignedTo: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        },
      },
    })

    const mapped = projectors.flatMap((p) => {
      // Use the earliest non-completed service record for this scheduled projector, if any
      const sr = p.serviceRecords[0]
      if (!sr) return []

      return {
        id: sr.id,
        serviceNumber: sr.serviceNumber,
        siteName: p.site?.siteName || "",
        siteAddress: p.site?.address || "",
        projectorModel: p.modelNo || null,
        projectorSerial: p.serialNo || null,
        screenNumber: sr.screenNumber ?? null,
        assignedToName: sr.assignedTo?.name || null,
        assignedToEmail: sr.assignedTo?.email || null,
        status: sr.startTime !== null ? "in_progress" : "scheduled",
        scheduledDate: sr.date ? sr.date.toISOString() : null,
      }
    })

    const filtered = q
      ? mapped.filter((s) => {
          const haystack = [
            s.siteName,
            s.siteAddress,
            s.projectorModel || "",
            s.projectorSerial || "",
            s.assignedToName || "",
          ]
            .join(" ")
            .toLowerCase()
          return haystack.includes(q)
        })
      : mapped

    return NextResponse.json({ services: filtered })
  } catch (error) {
    console.error("Error fetching scheduled services", error)
    return NextResponse.json({ error: "Failed to fetch scheduled services" }, { status: 500 })
  }
}
