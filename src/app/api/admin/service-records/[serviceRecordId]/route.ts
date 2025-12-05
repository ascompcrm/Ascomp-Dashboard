import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ serviceRecordId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceRecordId } = await context.params

    const service = await prisma.serviceRecord.findUnique({
      where: { id: serviceRecordId },
      include: {
        site: {
          select: {
            id: true,
            siteName: true,
            address: true,
            contactDetails: true,
          },
        },
        projector: {
          select: {
            id: true,
            modelNo: true,
            serialNo: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service record not found" }, { status: 404 })
    }

    // Build the same shape as /api/user/services/completed for reuse on the frontend
    const formattedService = {
      id: service.id,
      serviceNumber: service.serviceNumber,
      site: {
        id: service.site.id,
        name: service.site.siteName,
        address: service.site.address,
        contactDetails: service.site.contactDetails,
        screenNo: service.screenNumber,
      },
      projector: {
        id: service.projector.id,
        model: service.projector.modelNo,
        serialNo: service.projector.serialNo,
        runningHours: service.projectorRunningHours,
      },
      date: service.date?.toISOString() || null,
      completedAt: service.endTime?.toISOString() || service.createdAt.toISOString(),
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
      workDetails: {
        reflector: service.reflector,
        reflectorNote: service.reflectorNote,
        uvFilter: service.uvFilter,
        uvFilterNote: service.uvFilterNote,
        integratorRod: service.integratorRod,
        integratorRodNote: service.integratorRodNote,
        coldMirror: service.coldMirror,
        coldMirrorNote: service.coldMirrorNote,
        foldMirror: service.foldMirror,
        foldMirrorNote: service.foldMirrorNote,
        touchPanel: service.touchPanel,
        touchPanelNote: service.touchPanelNote,
        evbBoard: service.evbBoard,
        evbBoardNote: service.evbBoardNote,
        ImcbBoard: service.ImcbBoard,
        ImcbBoardNote: service.ImcbBoardNote,
        pibBoard: service.pibBoard,
        pibBoardNote: service.pibBoardNote,
        IcpBoard: service.IcpBoard,
        IcpBoardNote: service.IcpBoardNote,
        imbSBoard: service.imbSBoard,
        imbSBoardNote: service.imbSBoardNote,
        serialNumberVerified: service.serialNumberVerified,
        serialNumberVerifiedNote: service.serialNumberVerifiedNote,
        AirIntakeLadRad: service.AirIntakeLadRad,
        AirIntakeLadRadNote: service.AirIntakeLadRadNote,
        coolantLevelColor: service.coolantLevelColor,
        coolantLevelColorNote: service.coolantLevelColorNote,
        lightEngineWhite: service.lightEngineWhite,
        lightEngineWhiteNote: service.lightEngineWhiteNote,
        lightEngineRed: service.lightEngineRed,
        lightEngineRedNote: service.lightEngineRedNote,
        lightEngineGreen: service.lightEngineGreen,
        lightEngineGreenNote: service.lightEngineGreenNote,
        lightEngineBlue: service.lightEngineBlue,
        lightEngineBlueNote: service.lightEngineBlueNote,
        lightEngineBlack: service.lightEngineBlack,
        lightEngineBlackNote: service.lightEngineBlackNote,
        acBlowerVane: service.acBlowerVane,
        acBlowerVaneNote: service.acBlowerVaneNote,
        extractorVane: service.extractorVane,
        extractorVaneNote: service.extractorVaneNote,
        exhaustCfm: service.exhaustCfm,
        exhaustCfmNote: service.exhaustCfmNote,
        lightEngineFans: service.lightEngineFans,
        lightEngineFansNote: service.lightEngineFansNote,
        cardCageFans: service.cardCageFans,
        cardCageFansNote: service.cardCageFansNote,
        radiatorFanPump: service.radiatorFanPump,
        radiatorFanPumpNote: service.radiatorFanPumpNote,
        pumpConnectorHose: service.pumpConnectorHose,
        pumpConnectorHoseNote: service.pumpConnectorHoseNote,
        securityLampHouseLock: service.securityLampHouseLock,
        securityLampHouseLockNote: service.securityLampHouseLockNote,
        lampLocMechanism: service.lampLocMechanism,
        lampLocMechanismNote: service.lampLocMechanismNote,
        projectorPlacementEnvironment: service.projectorPlacementEnvironment,
        softwareVersion: service.softwareVersion,
        screenHeight: service.screenHeight,
        screenWidth: service.screenWidth,
        flatHeight: service.flatHeight,
        flatWidth: service.flatWidth,
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
        white4Kx: service.white4Kx,
        white4Ky: service.white4Ky,
        white4Kfl: service.white4Kfl,
        red2Kx: service.red2Kx,
        red2Ky: service.red2Ky,
        red2Kfl: service.red2Kfl,
        red4Kx: service.red4Kx,
        red4Ky: service.red4Ky,
        red4Kfl: service.red4Kfl,
        green2Kx: service.green2Kx,
        green2Ky: service.green2Ky,
        green2Kfl: service.green2Kfl,
        green4Kx: service.green4Kx,
        green4Ky: service.green4Ky,
        green4Kfl: service.green4Kfl,
        blue2Kx: service.blue2Kx,
        blue2Ky: service.blue2Ky,
        blue2Kfl: service.blue2Kfl,
        blue4Kx: service.blue4Kx,
        blue4Ky: service.blue4Ky,
        blue4Kfl: service.blue4Kfl,
        BW_Step_10_2Kx: service.BW_Step_10_2Kx,
        BW_Step_10_2Ky: service.BW_Step_10_2Ky,
        BW_Step_10_2Kfl: service.BW_Step_10_2Kfl,
        BW_Step_10_4Kx: service.BW_Step_10_4Kx,
        BW_Step_10_4Ky: service.BW_Step_10_4Ky,
        BW_Step_10_4Kfl: service.BW_Step_10_4Kfl,
        focusBoresight: service.focusBoresight,
        integratorPosition: service.integratorPosition,
        spotsOnScreen: service.spotsOnScreen,
        screenCroppingOk: service.screenCroppingOk,
        convergenceOk: service.convergenceOk,
        channelsCheckedOk: service.channelsCheckedOk,
        pixelDefects: service.pixelDefects,
        imageVibration: service.imageVibration,
        liteloc: service.liteloc,
        airPollutionLevel: service.airPollutionLevel,
        hcho: service.hcho,
        tvoc: service.tvoc,
        pm1: service.pm1,
        pm2_5: service.pm2_5,
        pm10: service.pm10,
        temperature: service.temperature,
        humidity: service.humidity,
        startTime: service.startTime?.toISOString() || null,
        endTime: service.endTime?.toISOString() || null,
        replacementRequired: (service as any).replacementRequired ?? null,
        photosDriveLink: service.photosDriveLink,
        recommendedParts: service.recommendedParts,
      },
    }

    return NextResponse.json({ service: formattedService })
  } catch (error) {
    console.error("Error fetching admin service record:", error)
    return NextResponse.json({ error: "Failed to fetch service record" }, { status: 500 })
  }
}


