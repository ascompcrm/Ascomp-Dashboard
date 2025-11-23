import { NextRequest, NextResponse } from "next/server"
import prisma from "@my-better-t-app/db"
import { ServiceStatus } from "../../../../../../../packages/db/prisma/generated/enums"

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
              where: {
                status: {
                  in: [ServiceStatus.SCHEDULED, ServiceStatus.IN_PROGRESS],
                },
              },
              take: 1,
            },
          },
          orderBy: {
            projectorModel: "asc",
          },
        },
      },
      orderBy: {
        siteName: "asc",
      },
    })

    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)

    // Format sites with projector status
    const formattedSites = sites.map((site) => ({
      id: site.id,
      name: site.siteName,
      address: site.address,
      location: site.address, // Using address as location for now
      contactDetails: site.contactDetails,
      screenNo: site.screenNo,
      createdDate: new Date().toISOString().split("T")[0], // Sites don't have createdAt in schema, using current date
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

        return {
          id: proj.id,
          name: `${proj.projectorModel} (${proj.serialNo})`,
          model: proj.projectorModel,
          serialNumber: proj.serialNo,
          installDate: proj.lastServiceAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          lastServiceDate: proj.lastServiceAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          status,
          nextServiceDue: proj.nextServiceAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          serviceHistory: [],
        }
      }),
    }))

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
    const existingSite = await prisma.site.findUnique({
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
        screenNo: "", // Default empty string since it's not provided in form
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

