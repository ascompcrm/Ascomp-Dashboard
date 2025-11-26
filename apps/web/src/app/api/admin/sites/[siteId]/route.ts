import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await context.params

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        projector: {
          include: {
            serviceRecords: {
              orderBy: {
                updatedAt: "desc",
              },
              take: 5,
              include: {
                assignedTo: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            projectorModel: "asc",
          },
        },
      },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)

    // Format site with projector status
    const formattedSite = {
      id: site.id,
      name: site.siteName,
      address: site.address,
      location: site.address,
      contactDetails: site.contactDetails,
      screenNo: site.screenNo,
      createdDate: new Date().toISOString().split("T")[0],
      projectors: site.projector.map((proj) => {
        // Determine status based on lastServiceAt and scheduled services
        let status: "completed" | "pending" | "scheduled" = "pending"
        if (proj.serviceRecords.length > 0) {
          status = "scheduled"
        } else if (proj.lastServiceAt && proj.lastServiceAt >= sixMonthsAgo) {
          status = "completed"
        } else {
          status = "pending"
        }

        const serviceHistory = proj.serviceRecords.map((record) => ({
          id: record.id,
          date: record.updatedAt?.toISOString() || record.date?.toISOString() || null,
          technician: record.assignedTo?.name || "Unassigned",
          notes: record.remarks || null,
          nextDue: proj.nextServiceAt?.toISOString().split("T")[0] || null,
          status: record.status,
          reportUrl: record.reportUrl,
          reportGenerated: record.reportGenerated,
        }))

        return {
          id: proj.id,
          name: `${proj.projectorModel} (${proj.serialNo})`,
          model: proj.projectorModel,
          serialNumber: proj.serialNo,
          installDate: proj.lastServiceAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          lastServiceDate: proj.lastServiceAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          status,
          nextServiceDue: proj.nextServiceAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          serviceHistory,
        }
      }),
    }

    return NextResponse.json({
      site: formattedSite,
    })
  } catch (error) {
    console.error("Error fetching site:", error)
    return NextResponse.json({ error: "Failed to fetch site" }, { status: 500 })
  }
}

