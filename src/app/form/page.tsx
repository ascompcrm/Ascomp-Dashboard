'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  generateMaintenanceReport,
  type MaintenanceReportData,
} from '@/components/PDFGenerator';

const mockData: MaintenanceReportData = {
  cinemaName: 'Mock Cinema 7',
  date: '2025-01-01',
  address: '123 Main St, Anytown, USA',
  contactDetails: 'John Doe – 555-123-4567',
  location: 'Anytown',
  screenNo: 'Screen 01',
  serviceVisit: 'John Doe - Quarterly PM',
  projectorModel: 'Barco SP4K-15',
  serialNo: 'SN-123456789',
  runningHours: '1,250',
  opticals: {
    reflector: { status: 'OK', yesNo: 'YES' },
    uvFilter: { status: 'OK', yesNo: 'YES' },
    integratorRod: { status: 'CLEAN', yesNo: 'YES' },
    coldMirror: { status: 'OK', yesNo: 'YES' },
    foldMirror: { status: 'OK', yesNo: 'YES' },
  },
  electronics: {
    touchPanel: { status: 'OK', yesNo: 'YES' },
    evbBoard: { status: 'OK', yesNo: 'YES' },
    ImcbBoard: { status: 'OK', yesNo: 'YES' },
    pibBoard: { status: 'OK', yesNo: 'YES' },
    IcpBoard: { status: 'OK', yesNo: 'YES' },
    imbSBoard: { status: 'OK', yesNo: 'YES' },
  },
  serialVerified: { status: 'MATCHED', yesNo: 'YES' },
  coolant: { status: 'OK', yesNo: 'YES' },
  AirIntakeLadRad: { status: 'OK', yesNo: 'YES' },
  lightEngineTest: {
    white: { status: 'OK', yesNo: 'YES' },
    red: { status: 'OK', yesNo: 'YES' },
    green: { status: 'OK', yesNo: 'YES' },
    blue: { status: 'OK', yesNo: 'YES' },
    black: { status: 'OK', yesNo: 'YES' },
  },
  mechanical: {
    acBlower: { status: 'OK', yesNo: 'YES' },
    extractor: { status: 'OK', yesNo: 'YES' },
    exhaustCFM: { status: '350 fpm', yesNo: 'YES' },
    lightEngine4Fans: { status: 'OK', yesNo: 'YES' },
    cardCageFans: { status: 'OK', yesNo: 'YES' },
    radiatorFan: { status: 'OK', yesNo: 'YES' },
    connectorHose: { status: 'OK', yesNo: 'YES' },
    securityLock: { status: 'LOCKED', yesNo: 'YES' },
  },
  lampLOC: { status: 'OK', yesNo: 'YES' },
  projectorEnvironment: 'Projection booth maintained at 22°C, low dust.',
  lampMake: 'Osram 2kW',
  lampHours: '1,000',
  currentLampHours: '250',
  voltageParams: { pvn: '230', pve: '228', nve: '0.5' },
  flBefore: '12.5 fL',
  flAfter: '10.5 fL',
  contentPlayer: 'Dolby IMS3000',
  acStatus: 'WORKING',
  leStatus: { status: 'GOOD fL', remarks: 'hi there fucking bitch bhenchod' },
  remarks: 'This is not working correctly. We need to replace it now, or it will stop working soon. Please purchase the available part and ensure all faulty items are replaced. Most of the components are not functioning properly, and even those that appear to work are unreliable. We must replace them now to avoid further issues.',
  leSerialNo: 'LE-987654321',
  mcgdData: {
    white2K: { fl: '12.5', x: '0.312', y: '0.329' },
    white4K: { fl: '12.5', x: '0.312', y: '0.329' },
    red2K: { fl: '7.5', x: '0.640', y: '0.330' },
    red4K: { fl: '7.5', x: '0.640', y: '0.330' },
    green2K: { fl: '7.2', x: '0.300', y: '0.600' },
    green4K: { fl: '7.2', x: '0.300', y: '0.600' },
    blue2K: { fl: '6.8', x: '0.150', y: '0.060' },
    blue4K: { fl: '6.8', x: '0.150', y: '0.060' },
  },
  cieXyz2K: { x: '0.312', y: '0.329', fl: '12.5' },
cieXyz4K: { x: '0.3', y: '0.39', fl: '4' },
  softwareVersion: 'v6.3.5',
  screenInfo: {
    scope: { height: '6.5', width: '15.2', gain: '1.3' },
    flat: { height: '5.6', width: '12.4', gain: '1.3' },
    make: 'Harkness Clarus XC',
  },
  throwDistance: '21m',
  imageEvaluation: {
    focusBoresite: { status: '', yesNo: 'YES' },
    integratorPosition: { status: 'how are you', yesNo: 'YES' },
    spotOnScreen: { status: '', yesNo: 'YES' },
    screenCropping: { status: 'i am fine', yesNo: 'YES' },
    convergence: { status: '', yesNo: 'YES' },
    channelsChecked: { status: 'i am fine', yesNo: 'YES' },
    pixelDefects: { status: 'i am fine', yesNo: 'NO' },
    imageVibration: { status: '', yesNo: 'YES' },
    liteLOC: { status: '', yesNo: 'YES' },
  },
  airPollution: {
    airPollutionLevel: 'Low',
    hcho: '0.03',
    tvoc: '0.20',
    pm10: '8',
    pm25: '5',
    pm100: '3',
    temperature: '22',
    humidity: '45',
  },
  recommendedParts: [
    { partNumber: 'AS-001', description: 'Integrator rod cleaning kit' },
    { partNumber: 'AS-014', description: 'Spare filter set' },
  ],
  issueNotes: [
    { label: 'Observation', note: 'Minor dust build-up on intake grille' },
  ],
  detectedIssues: [{ label: 'Cooling', value: 'None' }],
  reportGenerated: true,
  reportUrl: 'https://ascompinc.in/mock-report',
  startTime: '09:30',
  endTime: '12:15',
};

const FormPreviewPage = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const pdfBytes = await generateMaintenanceReport(mockData);
      const buffer = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(buffer).set(pdfBytes);
      const blob = new Blob([buffer], { type: 'application/pdf' });

      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    } catch (err) {
      setError('Failed to generate preview. Check console for details.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    generatePreview();

    return () => {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [generatePreview]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button onClick={generatePreview} disabled={isGenerating}>
          {isGenerating ? 'Generating…' : 'Refresh Preview'}
        </Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {previewUrl ? (
        <iframe
          title="Maintenance Report Preview"
          src={previewUrl}
          className="h-[80vh] w-full rounded border border-border"
        />
      ) : (
        <div className="flex h-[80vh] w-full items-center justify-center rounded border border-dashed border-border text-muted-foreground">
          PDF preview will appear here.
        </div>
      )}
    </div>
  );
};

export default FormPreviewPage;