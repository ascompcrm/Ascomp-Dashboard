import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from cookies using better-auth
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { serviceRecordId, workDetails, signatures, images, brokenImages } = body

    if (!serviceRecordId) {
      return NextResponse.json({ error: "Service record ID is required" }, { status: 400 })
    }

    // Verify the service record exists and is assigned to this user
    const serviceRecord = await prisma.serviceRecord.findUnique({
      where: { id: serviceRecordId },
    })

    if (!serviceRecord) {
      return NextResponse.json({ error: "Service record not found" }, { status: 404 })
    }

    if (serviceRecord.assignedToId !== userId) {
      return NextResponse.json({ error: "Unauthorized: Service not assigned to you" }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {
      status: ServiceStatus.COMPLETED,
      reportGenerated: true,
      endTime: new Date(),
    }

    // Helper to convert value to proper type
    const convertValue = (key: string, value: any): any => {
      if (value === undefined || value === null || value === "") {
        return undefined
      }

      // Float fields
      const floatFields = [
        'screenHeight', 'screenWidth', 'screenGain', 'throwDistance',
        'flCenter', 'flLeft', 'flRight', 'whiteX', 'whiteY', 'whiteFl',
        'redX', 'redY', 'redFl', 'greenX', 'greenY', 'greenFl',
        'blueX', 'blueY', 'blueFl', 'hcho', 'tvoc', 'pm1', 'pm2_5', 'pm10',
        'temperature', 'humidity'
      ]
      if (floatFields.includes(key)) {
        const num = parseFloat(value)
        return isNaN(num) ? undefined : num
      }

      // Integer fields
      const intFields = [
        'projectorRunningHours', 'lampTotalRunningHours', 'lampCurrentRunningHours'
      ]
      if (intFields.includes(key)) {
        const num = parseInt(value, 10)
        return isNaN(num) ? undefined : num
      }

      // Boolean fields
      const boolFields = [
        'replacementRequired', 'serialNumberVerified', 'focusBoresight',
        'integratorPosition', 'spotsOnScreen', 'screenCroppingOk',
        'convergenceOk', 'channelsCheckedOk'
      ]
      if (boolFields.includes(key)) {
        if (typeof value === 'boolean') return value
        if (typeof value === 'string') {
          const lower = value.toLowerCase()
          return lower === 'true' || lower === 'yes' || lower === '1'
        }
        return Boolean(value)
      }

      // Date fields
      if (key === 'date' && value) {
        const date = new Date(value)
        return isNaN(date.getTime()) ? undefined : date
      }

      if ((key === 'startTime' || key === 'endTime') && value) {
        const date = new Date(value)
        return isNaN(date.getTime()) ? undefined : date
      }

      // String fields - return as is
      return String(value)
    }

    // Fields that should not be updated (read-only or set on creation)
    const readonlyFields = new Set([
      'id', 'createdAt', 'userId', 'projectorId', 'siteId', 'serviceNumber',
      'assignedToId', 'issueNotes', 'signatures', 'reportGenerated', 'reportUrl',
      'images', 'brokenImages', 'date' // date is the scheduled date, don't overwrite
    ])

    // Handle recommendedParts as JSON
    if (workDetails?.recommendedParts) {
      const recommendedParts = workDetails.recommendedParts
      // Only save if it's a non-empty array
      if (Array.isArray(recommendedParts) && recommendedParts.length > 0) {
        updateData.recommendedParts = recommendedParts
      } else if (!Array.isArray(recommendedParts) && recommendedParts) {
        // If it's not an array but exists, save it anyway (for flexibility)
        updateData.recommendedParts = recommendedParts
      }
    }

    // Add work details with proper type conversion
    if (workDetails) {
      Object.keys(workDetails).forEach((key) => {
        // Skip readonly fields, issueNotes, and recommendedParts (handled separately)
        if (readonlyFields.has(key) || key === 'recommendedParts') return
        
        const converted = convertValue(key, workDetails[key])
        if (converted !== undefined) {
          updateData[key] = converted
        }
      })
    }

    // Add signatures
    if (signatures) {
      updateData.signatures = {
        engineer: signatures.engineer || signatures.engineerSignatureUrl || null,
        site: signatures.site || signatures.siteSignatureUrl || null,
      }
    }

    // Add images - extract URLs from image objects
    if (images !== undefined) {
      if (Array.isArray(images) && images.length > 0) {
        updateData.images = images.map((img: any) => 
          typeof img === 'string' ? img : img.url || img
        ).filter(Boolean)
      } else {
        updateData.images = []
      }
    }

    if (brokenImages !== undefined) {
      if (Array.isArray(brokenImages) && brokenImages.length > 0) {
        updateData.brokenImages = brokenImages.map((img: any) => 
          typeof img === 'string' ? img : img.url || img
        ).filter(Boolean)
      } else {
        updateData.brokenImages = []
      }
    }

    // Clean up undefined values (Prisma doesn't accept undefined)
    const cleanedData: any = {}
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        cleanedData[key] = updateData[key]
      }
    })

    // Update the service record
    const updatedRecord = await prisma.serviceRecord.update({
      where: { id: serviceRecordId },
      data: cleanedData,
    })

    return NextResponse.json({
      success: true,
      serviceRecord: {
        id: updatedRecord.id,
        status: updatedRecord.status,
      },
    })
  } catch (error) {
    console.error("Error completing service record:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        error: "Failed to complete service record",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

