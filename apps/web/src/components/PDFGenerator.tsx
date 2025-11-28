import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type StatusItem = {
  status: string;
  yesNo?: string;
};

export interface MaintenanceReportData {
  cinemaName: string
  date: string
  address: string
  contactDetails: string
  location: string
  screenNo: string
  serviceVisit: string
  projectorModel: string
  serialNo: string
  runningHours: string
  projectorEnvironment?: string
  startTime?: string
  endTime?: string

  opticals: {
    reflector: StatusItem;
    uvFilter: StatusItem;
    integratorRod: StatusItem;
    coldMirror: StatusItem;
    foldMirror: StatusItem;
  };

  electronics: {
    touchPanel: StatusItem;
    evbImcb: StatusItem;
    pibIcp: StatusItem;
    imbS: StatusItem;
  };

  serialVerified: StatusItem;
  disposableConsumables: StatusItem;
  coolant: StatusItem;

  lightEngineTest: {
    white: StatusItem;
    red: StatusItem;
    green: StatusItem;
    blue: StatusItem;
    black: StatusItem;
  };

  mechanical: {
    acBlower: StatusItem;
    extractor: StatusItem;
    exhaustCFM: StatusItem;
    lightEngine4Fans: StatusItem;
    cardCageFans: StatusItem;
    radiatorFan: StatusItem;
    connectorHose: StatusItem;
    securityLock: StatusItem;
  };

  lampLOC: StatusItem;

  lampMake: string;
  lampHours: string;
  currentLampHours: string;
  voltageParams: { pvn: string; pve: string; nve: string };
  flMeasurements: string;
  contentPlayer: string;
  acStatus: string;
  leStatus: string;
  remarks: string;
  leSerialNo: string;

  mcgdData: {
    w2k4k: { fl: string; x: string; y: string };
    r2k4k: { fl: string; x: string; y: string };
    g2k4k: { fl: string; x: string; y: string };
    b2k4k: { fl: string; x: string; y: string };
  };

  cieXyz: { x: string; y: string; fl: string };

  softwareVersion: string;
  screenInfo: {
    scope: { height: string; width: string; gain: string };
    flat: { height: string; width: string; gain: string };
    make: string;
  };
  throwDistance: string;

  imageEvaluation: {
    focusBoresite: string;
    integratorPosition: string;
    spotOnScreen: string;
    screenCropping: string;
    convergence: string;
    channelsChecked: string;
    pixelDefects: string;
    imageVibration: string;
    liteLOC: string;
  };

  airPollution: {
    hcho: string
    tvoc: string
    pm10: string
    pm25: string
    pm100: string
    temperature: string
    humidity: string
  }

  recommendedParts?: Array<{ partNumber: string; description: string }>
  issueNotes?: Array<{ label: string; note: string }>
  detectedIssues?: Array<{ label: string; value: string }>
  reportGenerated?: boolean
  reportUrl?: string
}

export async function generateMaintenanceReport(data: MaintenanceReportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Load and embed the company logo
  let logoImage;
  let logoImage2;
  try {
    // Try to load from public folder (works in browser/client-side)
    const logoResponse = await fetch('/LOGO/Ascomp.png');
    const logoResponse2 = await fetch('/LOGO/Christie.png');
    if (logoResponse.ok) {
      const logoBytes = await logoResponse.arrayBuffer();
      logoImage = await pdfDoc.embedPng(logoBytes);
    }
    if (logoResponse2.ok) {
      const logoBytes = await logoResponse2.arrayBuffer();
      logoImage2 = await pdfDoc.embedPng(logoBytes);
    }
  } catch (error) {
    // If fetch fails (e.g., server-side), try using file system
    try {
      if (typeof window === 'undefined') {
        // Server-side: use Node.js fs
        const fs = require('fs');
        const path = require('path');
        const logoPath = path.join(process.cwd(), 'public', 'LOGO', 'Ascomp.png');
        const logoPath2 = path.join(process.cwd(), 'public', 'LOGO', 'Christie.png');
        const logoBytes = fs.readFileSync(logoPath);
        const logoBytes2 = fs.readFileSync(logoPath2);
        logoImage = await pdfDoc.embedPng(logoBytes);
        logoImage2 = await pdfDoc.embedPng(logoBytes2);
      }
    } catch (fsError) {
      console.warn('Could not load logo image, falling back to text:', fsError);
    }
  }

  const page1 = pdfDoc.addPage([595, 842]);
  const page2 = pdfDoc.addPage([595, 842]);

  const { width, height } = page1.getSize();

  let yPos = height - 50;

  page1.drawRectangle({
    x: 40,
    y: yPos - 30,
    width: width - 60,
    height: 30,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  if (logoImage) {
    // Draw the logo image (scaled to fit nicely in the header)
    const logoScale = 0.016; // Reduced scale for smaller logo
    const logoDims = logoImage.scale(logoScale);
    const logoHeight = logoDims.height;
    const headerCenterY = yPos - 15; // Center of the 30px header box
    page1.drawImage(logoImage, {
      x: 50,
      y: headerCenterY - logoHeight / 2,
      width: logoDims.width,
      height: logoHeight,
    });
  } else {
    // Fallback to text if logo couldn't be loaded
    page1.drawText('ASCOMP INC.', {
      x: 50,
      y: yPos - 20,
      size: 16,
      font: timesRomanBold,
      color: rgb(0.2, 0.6, 0.8),
    });
  }

  if (logoImage2) {
    // Draw the logo image (scaled to fit nicely in the header)
    const logoScale = 0.2; // Reduced scale for smaller logo
    const logoDims = logoImage2.scale(logoScale);
    const logoHeight = logoDims.height;
    const headerCenterY = yPos - 15; // Center of the 30px header box
    page1.drawImage(logoImage2, {
      x: 500,
      y: headerCenterY - logoHeight / 2,
      width: logoDims.width,
      height: logoHeight,
    });
  } else {
    // Fallback to text if logo couldn't be loaded
    page1.drawText('ASCOMP INC.', {
      x: 450,
      y: 10,
      size: 16,
      font: timesRomanBold,
      color: rgb(0.2, 0.6, 0.8),
    });
  }

  page1.drawText('EW - Preventive Maintenance Report', {
    x: 220,
    y: yPos - 20,
    size: 14,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  yPos -= 35;

  // Contact Details Section - Highlighted format
  const contactBoxHeight = 50;
  const contactBoxY = yPos - contactBoxHeight;
  
  // Background highlight
  page1.drawRectangle({
    x: 40,
    y: contactBoxY,
    width: width - 60,
    height: contactBoxHeight,
    color: rgb(0.95, 0.95, 0.95), // Light gray background
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Contact Details heading
  page1.drawText('Contact Details', {
    x: 50,
    y: yPos - 12,
    size: 10,
    font: timesRomanBold,
    color: rgb(0.2, 0.6, 0.8),
  });

  // Address
  page1.drawText('Address:', {
    x: 50,
    y: yPos - 28,
    size: 9,
    font: timesRomanBold,
  });
  page1.drawText('9, Community Centre, 2nd Floor, Phase I, Mayapuri, New Delhi, Delhi 110064', {
    x: 120,
    y: yPos - 28,
    size: 8,
    font: timesRoman,
  });

  // Contact information
  page1.drawText('Landline:', {
    x: 50,
    y: yPos - 40,
    size: 9,
    font: timesRomanBold,
  });
  page1.drawText('011-45501226', {
    x: 120,
    y: yPos - 40,
    size: 8,
    font: timesRoman,
  });

  page1.drawText('Mobile:', {
    x: 240,
    y: yPos - 40,
    size: 9,
    font: timesRomanBold,
  });
  page1.drawText('8882475207', {
    x: 300,
    y: yPos - 40,
    size: 8,
    font: timesRoman,
  });

  page1.drawText('Email:', {
    x: 400,
    y: yPos - 40,
    size: 9,
    font: timesRomanBold,
  });
  page1.drawText('helpdesk@ascompinc.in', {
    x: 450,
    y: yPos - 40,
    size: 8,
    font: timesRoman,
  });

  yPos -= 50;

  drawTableRow(page1, timesRomanBold, timesRoman, 40, yPos, width - 80,
    ['CINEMA NAME:', data.cinemaName, 'DATE:', data.date], [100, 150, 80, 205], 20);
  yPos -= 20;

  drawTableRow(page1, timesRomanBold, timesRoman, 40, yPos, width - 80,
    ['Address:', data.address], [100, 435], 20);
  yPos -= 20;

  drawTableRow(page1, timesRomanBold, timesRoman, 40, yPos, width - 80,
    ['Contact Details', data.contactDetails, 'LOCATION:', data.location], [100, 150, 80, 205], 20);
  yPos -= 20;

  drawTableRow(page1, timesRomanBold, timesRoman, 40, yPos, width - 80,
    ['SCREEN No:', data.screenNo, 'Engg and EW Service visit:', data.serviceVisit], [100, 150, 120, 165], 20);
  yPos -= 20;

  drawTableRow(page1, timesRomanBold, timesRoman, 40, yPos, width - 80,
    ['Projector Model:', data.projectorModel, 'Serial No.:', data.serialNo, 'Running Hours:', data.runningHours], [80, 80, 80, 80, 80, 135], 20);
  yPos -= 20;


  drawTableRow(page1, timesRomanBold, timesRomanBold, 40, yPos, width - 80,
    ['SECTIONS', 'DESCRIPTION', 'STATUS', 'YES/NO - OK'], [120, 235, 100, 80], 20);
  yPos -= 20;

  yPos = drawSection(page1, timesRomanBold, timesRoman, 40, yPos, width - 80, 'OPTICALS', [
    ['Reflector', data.opticals.reflector.status, data.opticals.reflector.yesNo || ''],
    ['UV filter', data.opticals.uvFilter.status, data.opticals.uvFilter.yesNo || ''],
    ['Integrator Rod', data.opticals.integratorRod.status, data.opticals.integratorRod.yesNo || ''],
    ['Cold Mirror', data.opticals.coldMirror.status, data.opticals.coldMirror.yesNo || ''],
    ['Fold Mirror', data.opticals.foldMirror.status, data.opticals.foldMirror.yesNo || ''],
  ]);

  yPos = drawSection(page1, timesRomanBold, timesRoman, 40, yPos, width - 80, 'ELECTRONICS', [
    ['Touch Panel', data.electronics.touchPanel.status, data.electronics.touchPanel.yesNo || ''],
    ['EVB and IMCB Board', data.electronics.evbImcb.status, data.electronics.evbImcb.yesNo || ''],
    ['PIB and ICP Board', data.electronics.pibIcp.status, data.electronics.pibIcp.yesNo || ''],
    ['IMB/S Board', data.electronics.imbS.status, data.electronics.imbS.yesNo || ''],
  ]);

  yPos = drawSection(page1, timesRomanBold, timesRoman, 40, yPos, width - 80, 'Serial Number verified', [
    ['Chassis label vs Touch Panel', data.serialVerified.status, data.serialVerified.yesNo || ''],
  ]);

  yPos = drawSection(page1, timesRomanBold, timesRoman, 40, yPos, width - 80, 'Disposable Consumables', [
    ['Air Intake, LAD and RAD', data.disposableConsumables.status, data.disposableConsumables.yesNo || ''],
  ]);

  yPos = drawSection(page1, timesRomanBold, timesRoman, 40, yPos, width - 80, 'Coolant', [
    ['Level and Color', data.coolant.status, data.coolant.yesNo || ''],
  ]);

  yPos = drawSection(page1, timesRomanBold, timesRoman, 40, yPos, width - 80, 'Light Engine Test Pattern', [
    ['White', data.lightEngineTest.white.status, data.lightEngineTest.white.yesNo || ''],
    ['Red', data.lightEngineTest.red.status, data.lightEngineTest.red.yesNo || ''],
    ['Green', data.lightEngineTest.green.status, data.lightEngineTest.green.yesNo || ''],
    ['Blue', data.lightEngineTest.blue.status, data.lightEngineTest.blue.yesNo || ''],
    ['Black', data.lightEngineTest.black.status, data.lightEngineTest.black.yesNo || ''],
  ]);

  yPos = drawSection(page1, timesRomanBold, timesRoman, 40, yPos, width - 80, 'MECHANICAL', [
    ['AC blower and Vane Switch', data.mechanical.acBlower.status, data.mechanical.acBlower.yesNo || ''],
    ['Extractor Vane Switch', data.mechanical.extractor.status, data.mechanical.extractor.yesNo || ''],
    ['Exhaust CFM - Value', data.mechanical.exhaustCFM.status, data.mechanical.exhaustCFM.yesNo || ''],
    ['Light Engine 4 fans with LAD fan', data.mechanical.lightEngine4Fans.status, data.mechanical.lightEngine4Fans.yesNo || ''],
    ['Card Cage Top and Bottom fans', data.mechanical.cardCageFans.status, data.mechanical.cardCageFans.yesNo || ''],
    ['Radiator fan and Pump', data.mechanical.radiatorFan.status, data.mechanical.radiatorFan.yesNo || ''],
    ['Connector and hose for the Pump', data.mechanical.connectorHose.status, data.mechanical.connectorHose.yesNo || ''],
    ['Security and lamp house lock switch', data.mechanical.securityLock.status, data.mechanical.securityLock.yesNo || ''],
  ]);

  yPos = drawSection(page1, timesRomanBold, timesRoman, 40, yPos, width - 80, 'Lamp LOC Mechanism X,', [
    ['Y and Z movement', data.lampLOC.status, data.lampLOC.yesNo || ''],
  ])

  if (data.projectorEnvironment) {
    drawTableRow(page1, timesRomanBold, timesRoman, 40, yPos, width - 80,
      ['Projector placement, room and environment:', data.projectorEnvironment], [200, 335], 40);
    yPos -= 40;
  }

  yPos = height - 50;

  drawTableRow(page2, timesRomanBold, timesRoman, 40, yPos, width - 80,
    ['Lamp Make and Model:', data.lampMake], [150, 365], 20);
  yPos -= 20;

  drawTableRow(page2, timesRomanBold, timesRoman, 40, yPos, width - 80,
    ['Number of hours running:', data.lampHours, 'Current lamp running hours:', data.currentLampHours], [150, 150, 150, 65], 20);
  yPos -= 20;

  drawTableRow(page2, timesRomanBold, timesRomanBold, 40, yPos, width - 80,
    ['Voltage parameters', 'P vs N', 'P vs E', 'N vs E'], [150, 122, 122, 121], 20);
  yPos -= 20;

  drawTableRow(page2, timesRoman, timesRoman, 40, yPos, width - 80,
    ['', data.voltageParams.pvn, data.voltageParams.pve, data.voltageParams.nve], [150, 122, 122, 121], 20);
  yPos -= 20;

  drawTableRow(page2, timesRomanBold, timesRomanBold, 40, yPos, width - 80,
    ['fL measurements:', 'Before', 'After'], [150, 150, 215, 365], 20);
  yPos -= 20;
  drawTableRow(page2, timesRoman, timesRoman, 40, yPos, width - 80,
    ['', data.flMeasurements, data.flMeasurements], [150, 150, 215], 20);
  yPos -= 20;

  drawTableRow(page2, timesRomanBold, timesRoman, 40, yPos, width - 80,
    ['Content Player Model:', data.contentPlayer, 'AC Status:', data.acStatus], [150, 150, 95, 120], 20);
  yPos -= 20;

  drawTableRow(page2, timesRomanBold, timesRoman, 40, yPos, width - 80,
    ['LE Status during PM:', data.leStatus], [150, 315], 20);
  yPos -= 20;

  drawTableRow(page2, timesRomanBold, timesRoman, 40, yPos, width - 80,
    ['Remarks:', data.remarks, 'LE S. No.', data.leSerialNo], [80, 285, 80, 70], 40)
  yPos -= 40

  // Service Timing - Always displayed
  // drawTableRow(page2, timesRomanBold, timesRomanBold, 40, yPos, width - 80,
  //   ['SERVICE TIMING', 'Start Time', 'End Time'], [150, 200, 165], 20)
  // yPos -= 20
  // drawTableRow(page2, timesRoman, timesRoman, 40, yPos, width - 80,
  //   ['', data.startTime || '-', data.endTime || '-'], [150, 200, 165], 20)
  // yPos -= 30

  // gain same in both
  const leftTableX = 40
  const rightTableX = 300
  const rightColumnStart = yPos
  let leftY = yPos

  drawTableRow(page2, timesRomanBold, timesRoman, leftTableX, leftY, 240,
    ['Software Version', data.softwareVersion], [80, 160], 20);
  leftY -= 45;

  page2.drawText('Screen Information in metres', {
    x: leftTableX,
    y: leftY,
    size: 10,
    font: timesRomanBold,
  });
  leftY -= 10;

  drawTableRow(page2, timesRomanBold, timesRomanBold, leftTableX, leftY, 240,
    ['', 'Height', 'Width', 'Gain'], [60, 60, 60, 60], 20);
  leftY -= 20;

  drawTableRow(page2, timesRomanBold, timesRoman, leftTableX, leftY, 240,
    ['SCOPE', data.screenInfo.scope.height, data.screenInfo.scope.width, data.screenInfo.scope.gain], [60, 60, 60, 60], 20);
  leftY -= 20;

  drawTableRow(page2, timesRomanBold, timesRoman, leftTableX, leftY, 240,
    ['FLAT', data.screenInfo.flat.height, data.screenInfo.flat.width, data.screenInfo.flat.gain], [60, 60, 60, 60], 20);
  leftY -= 20;

  drawTableRow(page2, timesRomanBold, timesRoman, leftTableX, leftY, 240,
    ['Screen', 'Make'], [120, 120], 20);
  leftY -= 20;

  drawTableRow(page2, timesRomanBold, timesRoman, leftTableX, leftY, 240,
    ['Throw Distance', data.throwDistance], [120, 120], 20);
  leftY -= 40;

  drawTableRow(page2, timesRomanBold, timesRomanBold, leftTableX, leftY, 240,
    ['Image Evaluation', 'OK - Yes/No'], [180, 60], 20);
  leftY -= 20;

  const evaluationItems = [
    ['Focus/boresite', data.imageEvaluation.focusBoresite],
    ['Integrator Position', data.imageEvaluation.integratorPosition],
    ['Any Spot on the Screen after PPM', data.imageEvaluation.spotOnScreen],
    ['Check Screen Cropping - FLAT and SCOPE', data.imageEvaluation.screenCropping],
    ['Convergence Checked', data.imageEvaluation.convergence],
    ['Channels Checked - Scope, Flat, Alternative', data.imageEvaluation.channelsChecked],
    ['Pixel defects', data.imageEvaluation.pixelDefects],
    ['Excessive image vibration', data.imageEvaluation.imageVibration],
    ['LiteLOC', data.imageEvaluation.liteLOC],
  ];

  for (const [label, value] of evaluationItems) {
    drawTableRow(page2, timesRoman, timesRoman, leftTableX, leftY, 240,
      [label || '', value || ''], [180, 60], 16)
    leftY -= 16
  }

  // Detected Issues - Always displayed
  // leftY -= 10
  // drawTableRow(page2, timesRomanBold, timesRomanBold, leftTableX, leftY, 240,
  //   ['Detected Issues', 'Status'], [180, 60], 20)
  // leftY -= 20
  // if (data.detectedIssues && data.detectedIssues.length > 0) {
  //   data.detectedIssues.forEach(({ label, value }) => {
  //     drawTableRow(page2, timesRoman, timesRoman, leftTableX, leftY, 240,
  //       [label || '', value || ''], [180, 60], 16)
  //     leftY -= 16
  //   })
  // } else {
  //   drawTableRow(page2, timesRoman, timesRoman, leftTableX, leftY, 240,
  //     ['None', '-'], [180, 60], 16)
  //   leftY -= 16
  // }

  // Issue Notes - Always displayed
  // leftY -= 10
  // drawTableRow(page2, timesRomanBold, timesRomanBold, leftTableX, leftY, 240,
  //   ['Issue Notes', 'Details'], [120, 120], 20)
  // leftY -= 20
  // if (data.issueNotes && data.issueNotes.length > 0) {
  //   data.issueNotes.forEach(({ label, note }) => {
  //     drawTableRow(page2, timesRoman, timesRoman, leftTableX, leftY, 240,
  //       [label || '', note || ''], [120, 120], 16)
  //     leftY -= 16
  //   })
  // } else {
  //   drawTableRow(page2, timesRoman, timesRoman, leftTableX, leftY, 240,
  //     ['None', '-'], [120, 120], 16)
  //   leftY -= 16
  // }

  let rightY = rightColumnStart;

  drawTableRow(page2, timesRomanBold, timesRomanBold, rightTableX, rightY, 255,
    ['MCGD', 'fL', 'x', 'y'], [120, 45, 45, 45], 20);
  rightY -= 20;

  drawTableRow(page2, timesRoman, timesRoman, rightTableX, rightY, 255,
    ['W2K /4K', data.mcgdData.w2k4k.fl, data.mcgdData.w2k4k.x, data.mcgdData.w2k4k.y], [120, 45, 45, 45], 20);
  rightY -= 20;

  drawTableRow(page2, timesRoman, timesRoman, rightTableX, rightY, 255,
    ['R2K /4K', data.mcgdData.r2k4k.fl, data.mcgdData.r2k4k.x, data.mcgdData.r2k4k.y], [120, 45, 45, 45], 20);
  rightY -= 20;

  drawTableRow(page2, timesRoman, timesRoman, rightTableX, rightY, 255,
    ['G2K /4K', data.mcgdData.g2k4k.fl, data.mcgdData.g2k4k.x, data.mcgdData.g2k4k.y], [120, 45, 45, 45], 20);
  rightY -= 20;

  drawTableRow(page2, timesRoman, timesRoman, rightTableX, rightY, 255,
    ['B2K /4K', data.mcgdData.b2k4k.fl, data.mcgdData.b2k4k.x, data.mcgdData.b2k4k.y], [120, 45, 45, 45], 20);
  rightY -= 40;

  page2.drawText('CIE XYZ Color Accuracy', {
    x: rightTableX,
    y: rightY,
    size: 10,
    font: timesRomanBold,
  });
  rightY -= 10;

  drawTableRow(page2, timesRomanBold, timesRoman, rightTableX, rightY, 255,
    ['Test Pattern', 'x', 'y', 'fL'], [120, 45, 45, 45], 20);
  rightY -= 20;

  drawTableRow(page2, timesRoman, timesRoman, rightTableX, rightY, 255,
    ['BW Step-10 2K /4K', data.cieXyz.x, data.cieXyz.y, data.cieXyz.fl], [120, 45, 45, 45], 20);
  rightY -= 40;

  // Recommended Parts on the right side - Always displayed
  page2.drawText('Recommended Parts', {
    x: rightTableX,
    y: rightY,
    size: 10,
    font: timesRomanBold,
  });
  rightY -= 10;
  drawTableRow(page2, timesRomanBold, timesRomanBold, rightTableX, rightY, 255,
    ['Part Name', 'Part Number'], [180, 75], 20);
  rightY -= 20;
  if (data.recommendedParts && data.recommendedParts.length > 0) {
    data.recommendedParts.forEach((part) => {
      const description = part.description || ''
      const partNumber = part.partNumber || ''
      // Split long descriptions across multiple lines if needed
      const descLines = description.length > 30 
        ? [description.substring(0, 30), description.substring(30)]
        : [description]
      
      descLines.forEach((line, idx) => {
        if (idx === 0) {
          drawTableRow(page2, timesRoman, timesRoman, rightTableX, rightY, 255,
            [line, partNumber], [180, 75], 16);
        } else {
          drawTableRow(page2, timesRoman, timesRoman, rightTableX, rightY, 255,
            [line, ''], [180, 75], 16);
        }
        rightY -= 16
      })
    })
  } else {
    drawTableRow(page2, timesRoman, timesRoman, rightTableX, rightY, 255,
      ['None', '-'], [180, 75], 16);
    rightY -= 16
  }
  rightY -= 10;

  leftY -= 40;

  drawTableRow(page2, timesRomanBold, timesRomanBold, leftTableX, leftY, width - 80,
    ['Air Pollution Level', 'HCHO', 'TVOC', 'PM1.0', 'PM2.5', 'PM10', 'Temperature C', 'Humidity %'], [100, 59, 59, 59, 59, 59, 59, 59], 20);
  leftY -= 20;

  drawTableRow(page2, timesRoman, timesRoman, leftTableX, leftY, width - 80,
    ['', data.airPollution.hcho, data.airPollution.tvoc, data.airPollution.pm100, data.airPollution.pm25, data.airPollution.pm10, data.airPollution.temperature, data.airPollution.humidity], [100, 59, 59, 59, 59, 59, 59, 59], 20);



  page2.drawText("Client's Signature & Stamp", {
    x: 60,
    y: 60,
    size: 10,
    font: timesRomanBold,
  });

  page2.drawText("Engineer's Signature", {
    x: width - 180,
    y: 60,
    size: 10,
    font: timesRomanBold,
  });

  return await pdfDoc.save();
}

function drawTableRow(
  page: any,
  boldFont: any,
  regularFont: any,
  x: number,
  y: number,
  _totalWidth: number,
  cells: string[],
  widths: number[],
  height: number
) {
  let currentX = x;

  for (let i = 0; i < cells.length; i++) {
    page.drawRectangle({
      x: currentX,
      y: y - height,
      width: widths[i] || 0,
      height: height,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });

    const font = i % 2 === 0 ? boldFont : regularFont;
    const textSize = 8;
    const text = cells[i] || '';
    const textX = currentX + 3;
    const textY = y - height + (height / 2) - 3;

    page.drawText(text, {
      x: textX,
      y: textY,
      size: textSize,
      font: font,
      color: rgb(0, 0, 0),
      maxWidth: (widths[i] || 0) - 6,
    });

    currentX += widths[i] || 0;
  }
}

function drawSection(
  page: any,
  boldFont: any,
  regularFont: any,
  x: number,
  y: number,
  _totalWidth: number,
  sectionName: string,
  items: string[][]
): number {
  const rowHeight = 15;
  let currentY = y;

  page.drawRectangle({
    x: x,
    y: currentY - rowHeight * items.length,
    width: 120,
    height: rowHeight * items.length,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });

  page.drawText(sectionName, {
    x: x + 5,
    y: currentY - 10,
    size: 8,
    font: boldFont,
  });

  for (let i = 0; i < items.length; i++) {
    const itemY = currentY - (i * rowHeight);

    // DESCRIPTION column
    page.drawRectangle({
      x: x + 120,
      y: itemY - rowHeight,
      width: 235,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });

    page.drawText(items[i]?.[0] || '', {
      x: x + 125,
      y: itemY - 10,
      size: 8,
      font: regularFont,
    });

    // STATUS column (free text like OK / Not OK / Needs Cleaning)
    page.drawRectangle({
      x: x + 355,
      y: itemY - rowHeight,
      width: 100,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });

    page.drawText(items[i]?.[1] || '', {
      x: x + 360,
      y: itemY - 10,
      size: 8,
      font: regularFont,
    });

    // YES/NO column left empty for tick / handwriting
    page.drawRectangle({
      x: x + 455,
      y: itemY - rowHeight,
      width: 80,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });

    page.drawText(items[i]?.[2] || '', {
      x: x + 460,
      y: itemY - 10,
      size: 8,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
  }

  return currentY - (rowHeight * items.length);
}
