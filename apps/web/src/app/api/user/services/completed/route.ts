import { NextRequest, NextResponse } from "next/server"
import prisma, { ServiceStatus } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch completed services assigned to this user
    const services = await prisma.serviceRecord.findMany({
      where: {
        assignedToId: userId,
        status: ServiceStatus.COMPLETED,
      },
      include: {
        site: {
          select: {
            id: true,
            siteName: true,
            address: true,
            contactDetails: true,
            screenNo: true,
          },
        },
        projector: {
          select: {
            id: true,
            projectorModel: true,
            serialNo: true,
            runningHours: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Format services for the frontend
    const formattedServices = services.map((service) => ({
      id: service.id,
      serviceNumber: service.serviceNumber,
      site: {
        id: service.site.id,
        name: service.site.siteName,
        address: service.site.address,
        contactDetails: service.site.contactDetails,
        screenNo: service.site.screenNo,
      },
      projector: {
        id: service.projector.id,
        model: service.projector.projectorModel,
        serialNo: service.projector.serialNo,
        runningHours: service.projector.runningHours,
      },
      date: service.date,
      completedAt: service.updatedAt,
      cinemaName: service.cinemaName,
      address: service.address,
      location: service.location,
      screenNumber: service.screenNumber,
      contactDetails: service.contactDetails,
      projectorRunningHours: service.projectorRunningHours,
      remarks: service.remarks,
      images: service.images || [],
      brokenImages: service.brokenImages || [],
      signatures: service.signatures,
      reportGenerated: service.reportGenerated,
      reportUrl: service.reportUrl,
      // Include all work details
      workDetails: {
        reflector: service.reflector,
        uvFilter: service.uvFilter,
        integratorRod: service.integratorRod,
        coldMirror: service.coldMirror,
        foldMirror: service.foldMirror,
        touchPanel: service.touchPanel,
        evbImcbBoard: service.evbImcbBoard,
        pibIcpBoard: service.pibIcpBoard,
        imbSBoard: service.imbSBoard,
        coolantLevelColor: service.coolantLevelColor,
        lightEngineWhite: service.lightEngineWhite,
        lightEngineRed: service.lightEngineRed,
        lightEngineGreen: service.lightEngineGreen,
        lightEngineBlue: service.lightEngineBlue,
        lightEngineBlack: service.lightEngineBlack,
        acBlowerVane: service.acBlowerVane,
        extractorVane: service.extractorVane,
        exhaustCfm: service.exhaustCfm,
        lightEngineFans: service.lightEngineFans,
        cardCageFans: service.cardCageFans,
        radiatorFanPump: service.radiatorFanPump,
        pumpConnectorHose: service.pumpConnectorHose,
        securityLampHouseLock: service.securityLampHouseLock,
        lampLocMechanism: service.lampLocMechanism,
        projectorPlacementEnvironment: service.projectorPlacementEnvironment,
        softwareVersion: service.softwareVersion,
        screenHeight: service.screenHeight,
        screenWidth: service.screenWidth,
        screenGain: service.screenGain,
        screenMake: service.screenMake,
        throwDistance: service.throwDistance,
        lampMakeModel: service.lampMakeModel,
        lampTotalRunningHours: service.lampTotalRunningHours,
        lampCurrentRunningHours: service.lampCurrentRunningHours,
        pvVsN: service.pvVsN,
        pvVsE: service.pvVsE,
        nvVsE: service.nvVsE,
        flLeft: service.flLeft,
        flRight: service.flRight,
        contentPlayerModel: service.contentPlayerModel,
        acStatus: service.acStatus,
        leStatus: service.leStatus,
        lightEngineSerialNumber: service.lightEngineSerialNumber,
        white2Kx: service.white2Kx,
        white2Ky: service.white2Ky,
        white2Kfl: service.white2Kfl,
        red2Kx: service.red2Kx,
        red2Ky: service.red2Ky,
        red2Kfl: service.red2Kfl,
        green2Kx: service.green2Kx,
        green2Ky: service.green2Ky,
        green2Kfl: service.green2Kfl,
        blue2Kx: service.blue2Kx,
        blue2Ky: service.blue2Ky,
        blue2Kfl: service.blue2Kfl,
        focusBoresight: service.focusBoresight,
        integratorPosition: service.integratorPosition,
        spotsOnScreen: service.spotsOnScreen,
        screenCroppingOk: service.screenCroppingOk,
        convergenceOk: service.convergenceOk,
        channelsCheckedOk: service.channelsCheckedOk,
        pixelDefects: service.pixelDefects,
        imageVibration: service.imageVibration,
        liteloc: service.liteloc,
        hcho: service.hcho,
        tvoc: service.tvoc,
        pm1: service.pm1,
        pm2_5: service.pm2_5,
        pm10: service.pm10,
        temperature: service.temperature,
        humidity: service.humidity,
        startTime: service.startTime,
        endTime: service.endTime,
        replacementRequired: service.replacementRequired,
        serialNumberVerified: service.serialNumberVerified,
      },
    }))

    return NextResponse.json({
      services: formattedServices,
      count: formattedServices.length,
    })
  } catch (error) {
    console.error("Error fetching completed services:", error)
    return NextResponse.json(
      { error: "Failed to fetch completed services" },
      { status: 500 }
    )
  }
}

