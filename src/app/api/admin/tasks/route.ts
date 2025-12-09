import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
  try{
    const res = await prisma.serviceRecord.findMany({
      include: {
        projector: true,
        site: true,
        user: true,
      }
    })

    const filtered = res.map((record: any) => {
      const { assignedToId, createdAt, userId, projector, site, user, ...rest } = record
      const { lastServiceAt, ...projectorRest } = projector || {}
      return {
        ...rest,
        projector: projectorRest,
        site: site,
        engineerVisited: user?.name || "",
      }
    })

    return NextResponse.json(filtered);

  } catch (e) {
    console.error("Error fetching site:", e)
    return NextResponse.json({ error: "Failed to fetch site" }, { status: 500 })
  }
}

