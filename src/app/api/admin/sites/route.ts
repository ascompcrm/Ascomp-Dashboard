import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"

// Helper function to generate MongoDB-style ObjectId
function generateObjectId(): string {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
}

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      include: {
        projector: {
          include: {
            serviceRecords: {
              // Fetch all service records to count completed ones
              select: {
                id: true,
                endTime: true,
                reportGenerated: true,
              },
            },
          },
          orderBy: {
            modelNo: "asc",
          },
        },
      },
      orderBy: {
        siteName: "asc",
      },
    })

    // Format sites with projector status
    const formattedSites = sites.map((site) => {
      // Count total completed services for all projectors in this site
      const totalCompletedServices = site.projector.reduce((acc, proj) => {
        // Count completed service records for this projector
        // Completed: has endTime or reportGenerated is true
        return acc + proj.serviceRecords.filter((record) =>
          record.endTime !== null || record.reportGenerated === true
        ).length
      }, 0)

      return {
        id: site.id,
        name: site.siteName,
        address: site.address,
        location: site.address, // Using address as location for now
        contactDetails: site.contactDetails,
        siteCode: site.siteCode || null,
        createdDate: new Date().toISOString().split("T")[0], // Sites don't have createdAt in schema, using current date
        totalCompletedServices,
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

          return {
            id: proj.id,
            name: `${proj.modelNo} (${proj.serialNo})`,
            model: proj.modelNo,
            serialNumber: proj.serialNo,
            installDate: proj.lastServiceAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
            lastServiceDate: proj.lastServiceAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
            status,
            serviceHistory: [],
          }
        }),
      }
    })

    return NextResponse.json({
      sites: formattedSites,
      count: formattedSites.length,
    })
  } catch (error) {
    console.error("Error fetching sites:", error)
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { siteName, address, contactDetails } = await request.json()

    if (!siteName || !address || !contactDetails) {
      return NextResponse.json(
        { error: "Site name, address, and contact details are required" },
        { status: 400 },
      )
    }

    // Check if site with same address already exists
    const existingSite = await prisma.site.findFirst({
      where: { address },
    })

    if (existingSite) {
      return NextResponse.json({ error: "Site with this address already exists" }, { status: 400 })
    }

    const site = await prisma.site.create({
      data: {
        id: generateObjectId(),
        siteName,
        address,
        contactDetails,
      },
      include: {
        projector: true,
      },
    })

    return NextResponse.json({
      success: true,
      site: {
        id: site.id,
        name: site.siteName,
        address: site.address,
        location: site.address,
        contactDetails: site.contactDetails,
        projectors: [],
      },
    })
  } catch (error) {
    console.error("Error creating site:", error)
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 })
  }
}

