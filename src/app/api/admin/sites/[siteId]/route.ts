import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"

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
                createdAt: "desc",
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
            modelNo: "asc",
          },
        },
      },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Format site with projector status
    const formattedSite = {
      id: site.id,
      name: site.siteName,
      address: site.address,
      location: site.address,
      contactDetails: site.contactDetails,
      siteCode: site.siteCode || null,
      createdDate: new Date().toISOString().split("T")[0],
      projectors: site.projector.map((proj) => {
        // Map projector.status enum to frontend status string
        let status: "completed" | "pending" | "scheduled" = "pending"
        const projectorStatus = proj.status
        
        switch (projectorStatus) {
          case ServiceStatus.COMPLETED:
            status = "completed"
            break
          case ServiceStatus.SCHEDULED:
            status = "scheduled"
            break
          case ServiceStatus.IN_PROGRESS:
            status = "scheduled" // In progress is treated as scheduled for display
            break
          case ServiceStatus.PENDING:
            status = "pending"
            break
          default:
            status = "pending"
        }

        const serviceHistory = proj.serviceRecords.map((record) => ({
          id: record.id,
          date: record.date?.toISOString() || record.createdAt?.toISOString() || null,
          technician: record.assignedTo?.name || "Unassigned",
          notes: record.remarks || null,
          reportUrl: record.reportUrl,
          reportGenerated: record.reportGenerated,
        }))

        return {
          id: proj.id,
          name: `${proj.modelNo} (${proj.serialNo})`,
          model: proj.modelNo,
          serialNumber: proj.serialNo,
          installDate: proj.lastServiceAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          lastServiceDate: proj.lastServiceAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          status,
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

