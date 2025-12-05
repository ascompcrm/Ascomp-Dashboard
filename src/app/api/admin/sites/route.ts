import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"

// Helper function to generate MongoDB-style ObjectId
function generateObjectId(): string {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
}

export async function GET() {
  try {
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)

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
                date: true,
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
          // Derive status based on lastServiceAt and projector status
          const lastServiceAt = proj.lastServiceAt
          let status: "completed" | "pending" | "scheduled"

          if (
            proj.status === ServiceStatus.SCHEDULED ||
            proj.status === ServiceStatus.IN_PROGRESS
          ) {
            // Any scheduled / in-progress work is treated as scheduled
            status = "scheduled"
          } else if (lastServiceAt && lastServiceAt >= sixMonthsAgo) {
            // Serviced within last ~6 months → completed
            status = "completed"
          } else {
            // Never serviced or serviced more than 6 months ago → pending
            status = "pending"
          }

          const nextServiceDue =
            lastServiceAt != null
              ? (() => {
                  const d = new Date(lastServiceAt)
                  d.setMonth(d.getMonth() + 6)
                  return d.toISOString().split("T")[0]
                })()
              : null

          const completedServiceHistory = proj.serviceRecords.filter(
            (record) => record.endTime !== null || record.reportGenerated === true,
          )

          return {
            id: proj.id,
            name: `${proj.modelNo} (${proj.serialNo})`,
            model: proj.modelNo,
            serialNumber: proj.serialNo,
            installDate: proj.lastServiceAt?.toISOString().split("T")[0] || null,
            lastServiceDate: proj.lastServiceAt?.toISOString().split("T")[0] || null,
            status,
            nextServiceDue,
            serviceHistory: completedServiceHistory,
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

