"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Image as ImageIcon, Folder, ExternalLink, Download, Edit } from "lucide-react"
import Image from "next/image"
import { generateMaintenanceReport, type MaintenanceReportData } from "@/components/PDFGenerator"

type ServiceRecord = {
  id: string
  [key: string]: any
}

const formatDate = (value?: string | null) => {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const formatIsoDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const EXCLUDED_KEYS = new Set([
  "id",
  "fieldWorkerId",
  "assignedToId",
  "createdAt",
  "userId",
  "reportGenerated",
  "reportUrl",
  "completedAt",
  "lastServiceDate",
  "projectorId",
  "siteId",
])

// Fields that have corresponding Note fields - merge them
const NOTE_FIELD_MAP: Record<string, string> = {
  reflector: "reflectorNote",
  uvFilter: "uvFilterNote",
  integratorRod: "integratorRodNote",
  coldMirror: "coldMirrorNote",
  foldMirror: "foldMirrorNote",
  touchPanel: "touchPanelNote",
  evbBoard: "evbBoardNote",
  ImcbBoard: "ImcbBoardNote",
  pibBoard: "pibBoardNote",
  IcpBoard: "IcpBoardNote",
  imbSBoard: "imbSBoardNote",
  serialNumberVerified: "serialNumberVerifiedNote",
  AirIntakeLadRad: "AirIntakeLadRadNote",
  coolantLevelColor: "coolantLevelColorNote",
  lightEngineWhite: "lightEngineWhiteNote",
  lightEngineRed: "lightEngineRedNote",
  lightEngineGreen: "lightEngineGreenNote",
  lightEngineBlue: "lightEngineBlueNote",
  lightEngineBlack: "lightEngineBlackNote",
  acBlowerVane: "acBlowerVaneNote",
  extractorVane: "extractorVaneNote",
  exhaustCfm: "exhaustCfmNote",
  lightEngineFans: "lightEngineFansNote",
  cardCageFans: "cardCageFansNote",
  radiatorFanPump: "radiatorFanPumpNote",
  pumpConnectorHose: "pumpConnectorHoseNote",
  lampLocMechanism: "lampLocMechanismNote",
  securityLampHouseLock: "securityLampHouseLockNote",
}

// Priority order for columns - most important first
const COLUMN_PRIORITY = [
  "action",
  "date",
  "serviceNumber",
  "siteName",
  "siteCode",
  "engineerVisited",
  "siteAddress",
  "siteContactDetails",
  "projectorModel",
  "projectorSerial",
  "workerName",
  "status",
  "scheduledDate",
  "projectorRunningHours",
  "cinemaName",
  "address",
  "location",
  "screenNumber",
  "contactDetails",
  "remarks",
]

const LABEL_OVERRIDES: Record<string, string> = {
  action: "",
  engineerVisited: "Engineer Visited",
  serviceNumber: "Service #",
  siteName: "Site",
  siteCode: "Site Code",
  siteAddress: "Site Address",
  siteContactDetails: "Site Contact",
  projectorName: "Projector",
  projectorModel: "Model #",
  projectorSerial: "Serial #",
  projectorStatus: "Projector Status",
  projectorServices: "Service Count",
  projectorLastServiceAt: "Last Service At",
  workerName: "Worker",
  status: "Status",
  scheduledDate: "Scheduled Date",
  date: "Date",
  createdAt: "Created At",
  updatedAt: "Updated At",
  startTime: "Start Time",
  endTime: "End Time",
}

const toLabel = (key: string) => {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key]
  // camelCase / snakeCase to Title Case
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Edit Service Dialog Component
function EditServiceDialog({
  open,
  onOpenChange,
  serviceId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceId: string | null
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [serviceData, setServiceData] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (open && serviceId) {
      const fetchService = async () => {
        try {
          const res = await fetch(`/api/admin/service-records/${serviceId}`, {
            credentials: "include",
          })
          if (res.ok) {
            const json = await res.json()
            const service = json.service || json
            setServiceData(service)
            // Map all service data to form format
            const mapped: any = {
              // Cinema Details
              cinemaName: service.cinemaName || "",
              address: service.address || "",
              contactDetails: service.contactDetails || "",
              location: service.location || "",
              screenNumber: service.screenNumber || "",
              // Projector Information
              projectorRunningHours: service.projectorRunningHours || "",
              projectorPlacementEnvironment: service.workDetails?.projectorPlacementEnvironment || "",
              softwareVersion: service.workDetails?.softwareVersion || "",
              lightEngineSerialNumber: service.workDetails?.lightEngineSerialNumber || "",
              // Screen Information
              screenHeight: service.workDetails?.screenHeight || "",
              screenWidth: service.workDetails?.screenWidth || "",
              flatHeight: service.workDetails?.flatHeight || "",
              flatWidth: service.workDetails?.flatWidth || "",
              screenGain: service.workDetails?.screenGain || "",
              screenMake: service.workDetails?.screenMake || "",
              throwDistance: service.workDetails?.throwDistance || "",
              // Lamp Information
              lampMakeModel: service.workDetails?.lampMakeModel || "",
              lampTotalRunningHours: service.workDetails?.lampTotalRunningHours || "",
              lampCurrentRunningHours: service.workDetails?.lampCurrentRunningHours || "",
              // Voltage Parameters
              pvVsN: service.workDetails?.pvVsN || "",
              pvVsE: service.workDetails?.pvVsE || "",
              nvVsE: service.workDetails?.nvVsE || "",
              // fL Measurements
              flLeft: service.workDetails?.flLeft || "",
              flRight: service.workDetails?.flRight || "",
              // Content Player & AC Status
              contentPlayerModel: service.workDetails?.contentPlayerModel || "",
              acStatus: service.workDetails?.acStatus || "",
              leStatus: service.workDetails?.leStatus || "",
              // Optical Fields
              reflector: service.workDetails?.reflector || "",
              reflectorNote: service.workDetails?.reflectorNote || "",
              uvFilter: service.workDetails?.uvFilter || "",
              uvFilterNote: service.workDetails?.uvFilterNote || "",
              integratorRod: service.workDetails?.integratorRod || "",
              integratorRodNote: service.workDetails?.integratorRodNote || "",
              coldMirror: service.workDetails?.coldMirror || "",
              coldMirrorNote: service.workDetails?.coldMirrorNote || "",
              foldMirror: service.workDetails?.foldMirror || "",
              foldMirrorNote: service.workDetails?.foldMirrorNote || "",
              // Electronic Fields
              touchPanel: service.workDetails?.touchPanel || "",
              touchPanelNote: service.workDetails?.touchPanelNote || "",
              evbBoard: service.workDetails?.evbBoard || "",
              evbBoardNote: service.workDetails?.evbBoardNote || "",
              ImcbBoard: service.workDetails?.ImcbBoard || "",
              ImcbBoardNote: service.workDetails?.ImcbBoardNote || "",
              pibBoard: service.workDetails?.pibBoard || "",
              pibBoardNote: service.workDetails?.pibBoardNote || "",
              IcpBoard: service.workDetails?.IcpBoard || "",
              IcpBoardNote: service.workDetails?.IcpBoardNote || "",
              imbSBoard: service.workDetails?.imbSBoard || "",
              imbSBoardNote: service.workDetails?.imbSBoardNote || "",
              // Other Status Fields
              serialNumberVerified: service.workDetails?.serialNumberVerified || "",
              serialNumberVerifiedNote: service.workDetails?.serialNumberVerifiedNote || "",
              AirIntakeLadRad: service.workDetails?.AirIntakeLadRad || "",
              AirIntakeLadRadNote: service.workDetails?.AirIntakeLadRadNote || "",
              coolantLevelColor: service.workDetails?.coolantLevelColor || "",
              coolantLevelColorNote: service.workDetails?.coolantLevelColorNote || "",
              // Light Engine Test
              lightEngineWhite: service.workDetails?.lightEngineWhite || "",
              lightEngineWhiteNote: service.workDetails?.lightEngineWhiteNote || "",
              lightEngineRed: service.workDetails?.lightEngineRed || "",
              lightEngineRedNote: service.workDetails?.lightEngineRedNote || "",
              lightEngineGreen: service.workDetails?.lightEngineGreen || "",
              lightEngineGreenNote: service.workDetails?.lightEngineGreenNote || "",
              lightEngineBlue: service.workDetails?.lightEngineBlue || "",
              lightEngineBlueNote: service.workDetails?.lightEngineBlueNote || "",
              lightEngineBlack: service.workDetails?.lightEngineBlack || "",
              lightEngineBlackNote: service.workDetails?.lightEngineBlackNote || "",
              // Mechanical Fields
              acBlowerVane: service.workDetails?.acBlowerVane || "",
              acBlowerVaneNote: service.workDetails?.acBlowerVaneNote || "",
              extractorVane: service.workDetails?.extractorVane || "",
              extractorVaneNote: service.workDetails?.extractorVaneNote || "",
              exhaustCfm: service.workDetails?.exhaustCfm || "",
              exhaustCfmNote: service.workDetails?.exhaustCfmNote || "",
              lightEngineFans: service.workDetails?.lightEngineFans || "",
              lightEngineFansNote: service.workDetails?.lightEngineFansNote || "",
              cardCageFans: service.workDetails?.cardCageFans || "",
              cardCageFansNote: service.workDetails?.cardCageFansNote || "",
              radiatorFanPump: service.workDetails?.radiatorFanPump || "",
              radiatorFanPumpNote: service.workDetails?.radiatorFanPumpNote || "",
              pumpConnectorHose: service.workDetails?.pumpConnectorHose || "",
              pumpConnectorHoseNote: service.workDetails?.pumpConnectorHoseNote || "",
              securityLampHouseLock: service.workDetails?.securityLampHouseLock || "",
              securityLampHouseLockNote: service.workDetails?.securityLampHouseLockNote || "",
              lampLocMechanism: service.workDetails?.lampLocMechanism || "",
              lampLocMechanismNote: service.workDetails?.lampLocMechanismNote || "",
              // Color Accuracy (MCGD Data)
              white2Kx: service.workDetails?.white2Kx || "",
              white2Ky: service.workDetails?.white2Ky || "",
              white2Kfl: service.workDetails?.white2Kfl || "",
              white4Kx: service.workDetails?.white4Kx || "",
              white4Ky: service.workDetails?.white4Ky || "",
              white4Kfl: service.workDetails?.white4Kfl || "",
              red2Kx: service.workDetails?.red2Kx || "",
              red2Ky: service.workDetails?.red2Ky || "",
              red2Kfl: service.workDetails?.red2Kfl || "",
              red4Kx: service.workDetails?.red4Kx || "",
              red4Ky: service.workDetails?.red4Ky || "",
              red4Kfl: service.workDetails?.red4Kfl || "",
              green2Kx: service.workDetails?.green2Kx || "",
              green2Ky: service.workDetails?.green2Ky || "",
              green2Kfl: service.workDetails?.green2Kfl || "",
              green4Kx: service.workDetails?.green4Kx || "",
              green4Ky: service.workDetails?.green4Ky || "",
              green4Kfl: service.workDetails?.green4Kfl || "",
              blue2Kx: service.workDetails?.blue2Kx || "",
              blue2Ky: service.workDetails?.blue2Ky || "",
              blue2Kfl: service.workDetails?.blue2Kfl || "",
              blue4Kx: service.workDetails?.blue4Kx || "",
              blue4Ky: service.workDetails?.blue4Ky || "",
              blue4Kfl: service.workDetails?.blue4Kfl || "",
              BW_Step_10_2Kx: service.workDetails?.BW_Step_10_2Kx || "",
              BW_Step_10_2Ky: service.workDetails?.BW_Step_10_2Ky || "",
              BW_Step_10_2Kfl: service.workDetails?.BW_Step_10_2Kfl || "",
              BW_Step_10_4Kx: service.workDetails?.BW_Step_10_4Kx || "",
              BW_Step_10_4Ky: service.workDetails?.BW_Step_10_4Ky || "",
              BW_Step_10_4Kfl: service.workDetails?.BW_Step_10_4Kfl || "",
              // Image Evaluation
              focusBoresight: service.workDetails?.focusBoresight || false,
              integratorPosition: service.workDetails?.integratorPosition || false,
              spotsOnScreen: service.workDetails?.spotsOnScreen || false,
              screenCroppingOk: service.workDetails?.screenCroppingOk || false,
              convergenceOk: service.workDetails?.convergenceOk || false,
              channelsCheckedOk: service.workDetails?.channelsCheckedOk || false,
              pixelDefects: service.workDetails?.pixelDefects || "",
              imageVibration: service.workDetails?.imageVibration || "",
              liteloc: service.workDetails?.liteloc || "",
              // Air Pollution Data
              airPollutionLevel: service.workDetails?.airPollutionLevel || "",
              hcho: service.workDetails?.hcho || "",
              tvoc: service.workDetails?.tvoc || "",
              pm1: service.workDetails?.pm1 || "",
              pm2_5: service.workDetails?.pm2_5 || "",
              pm10: service.workDetails?.pm10 || "",
              temperature: service.workDetails?.temperature || "",
              humidity: service.workDetails?.humidity || "",
              // Remarks
              remarks: service.remarks || "",
              photosDriveLink: service.workDetails?.photosDriveLink || "",
            }
            setFormData(mapped)
          }
        } catch (error) {
          console.error("Failed to fetch service:", error)
        }
      }
      fetchService()
    }
  }, [open, serviceId])

  const handleSave = async () => {
    if (!serviceId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/service-records/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          workDetails: formData,
          signatures: serviceData?.signatures,
          images: serviceData?.images || [],
          brokenImages: serviceData?.brokenImages || [],
        }),
      })
      if (res.ok) {
        onSuccess()
      } else {
        const error = await res.json()
        alert(`Failed to update: ${error.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to update service:", error)
      alert("Failed to update service record")
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6 pb-4 border-b-2 border-gray-300 last:border-b-0">
      <h3 className="font-bold text-black mb-4 text-base">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )

  const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold text-black mb-1">{label}</label>
      {children}
    </div>
  )

  const StatusField = ({ field, label }: { field: string; label: string }) => (
    <FormField label={label}>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={formData[field] || ""}
          onChange={(e) => updateField(field, e.target.value)}
          className="border-2 border-black p-2 text-sm bg-white"
        >
          <option value="">Select</option>
          <option value="OK">OK</option>
          <option value="YES">YES</option>
          <option value="NO">NO</option>
        </select>
        <Input
          value={formData[`${field}Note`] || ""}
          onChange={(e) => updateField(`${field}Note`, e.target.value)}
          placeholder="Note"
          className="border-2 border-black text-sm"
        />
      </div>
    </FormField>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Record</DialogTitle>
        </DialogHeader>
        {serviceData ? (
          <div className="space-y-4 mt-4">
            {/* Cinema Details */}
            <FormSection title="Cinema Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Cinema Name">
                  <Input
                    value={formData.cinemaName || ""}
                    onChange={(e) => updateField("cinemaName", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Address">
                  <Input
                    value={formData.address || ""}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Contact Details">
                  <Input
                    value={formData.contactDetails || ""}
                    onChange={(e) => updateField("contactDetails", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Location">
                  <Input
                    value={formData.location || ""}
                    onChange={(e) => updateField("location", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Screen Number">
                  <Input
                    value={formData.screenNumber || ""}
                    onChange={(e) => updateField("screenNumber", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Projector Information */}
            <FormSection title="Projector Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Projector Running Hours">
                  <Input
                    type="number"
                    value={formData.projectorRunningHours || ""}
                    onChange={(e) => updateField("projectorRunningHours", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Projector Placement Environment">
                  <Input
                    value={formData.projectorPlacementEnvironment || ""}
                    onChange={(e) => updateField("projectorPlacementEnvironment", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Software Version">
                  <Input
                    value={formData.softwareVersion || ""}
                    onChange={(e) => updateField("softwareVersion", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Light Engine Serial Number">
                  <Input
                    value={formData.lightEngineSerialNumber || ""}
                    onChange={(e) => updateField("lightEngineSerialNumber", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Screen Information */}
            <FormSection title="Screen Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Screen Height">
                  <Input
                    type="number"
                    value={formData.screenHeight || ""}
                    onChange={(e) => updateField("screenHeight", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Screen Width">
                  <Input
                    type="number"
                    value={formData.screenWidth || ""}
                    onChange={(e) => updateField("screenWidth", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Screen Gain">
                  <Input
                    type="number"
                    value={formData.screenGain || ""}
                    onChange={(e) => updateField("screenGain", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Flat Height">
                  <Input
                    type="number"
                    value={formData.flatHeight || ""}
                    onChange={(e) => updateField("flatHeight", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Flat Width">
                  <Input
                    type="number"
                    value={formData.flatWidth || ""}
                    onChange={(e) => updateField("flatWidth", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Screen Make">
                  <Input
                    value={formData.screenMake || ""}
                    onChange={(e) => updateField("screenMake", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Throw Distance">
                  <Input
                    type="number"
                    value={formData.throwDistance || ""}
                    onChange={(e) => updateField("throwDistance", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Lamp Information */}
            <FormSection title="Lamp Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Lamp Make/Model">
                  <Input
                    value={formData.lampMakeModel || ""}
                    onChange={(e) => updateField("lampMakeModel", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Lamp Total Running Hours">
                  <Input
                    type="number"
                    value={formData.lampTotalRunningHours || ""}
                    onChange={(e) => updateField("lampTotalRunningHours", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Lamp Current Running Hours">
                  <Input
                    type="number"
                    value={formData.lampCurrentRunningHours || ""}
                    onChange={(e) => updateField("lampCurrentRunningHours", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Voltage Parameters */}
            <FormSection title="Voltage Parameters">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="PV vs N">
                  <Input
                    type="number"
                    value={formData.pvVsN || ""}
                    onChange={(e) => updateField("pvVsN", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="PV vs E">
                  <Input
                    type="number"
                    value={formData.pvVsE || ""}
                    onChange={(e) => updateField("pvVsE", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="NV vs E">
                  <Input
                    type="number"
                    value={formData.nvVsE || ""}
                    onChange={(e) => updateField("nvVsE", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* fL Measurements */}
            <FormSection title="fL Measurements">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="fL Left">
                  <Input
                    type="number"
                    value={formData.flLeft || ""}
                    onChange={(e) => updateField("flLeft", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="fL Right">
                  <Input
                    type="number"
                    value={formData.flRight || ""}
                    onChange={(e) => updateField("flRight", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Content Player & AC Status */}
            <FormSection title="Content Player & AC Status">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Content Player Model">
                  <Input
                    value={formData.contentPlayerModel || ""}
                    onChange={(e) => updateField("contentPlayerModel", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="AC Status">
                  <Input
                    value={formData.acStatus || ""}
                    onChange={(e) => updateField("acStatus", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="LE Status">
                  <Input
                    value={formData.leStatus || ""}
                    onChange={(e) => updateField("leStatus", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Optical Fields */}
            <FormSection title="Optical Components">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusField field="reflector" label="Reflector" />
                <StatusField field="uvFilter" label="UV Filter" />
                <StatusField field="integratorRod" label="Integrator Rod" />
                <StatusField field="coldMirror" label="Cold Mirror" />
                <StatusField field="foldMirror" label="Fold Mirror" />
              </div>
            </FormSection>

            {/* Electronic Fields */}
            <FormSection title="Electronic Components">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusField field="touchPanel" label="Touch Panel" />
                <StatusField field="evbBoard" label="EVB Board" />
                <StatusField field="ImcbBoard" label="IMCB Board" />
                <StatusField field="pibBoard" label="PIB Board" />
                <StatusField field="IcpBoard" label="ICP Board" />
                <StatusField field="imbSBoard" label="IMB S Board" />
              </div>
            </FormSection>

            {/* Other Status Fields */}
            <FormSection title="Other Status Fields">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusField field="serialNumberVerified" label="Serial Number Verified" />
                <StatusField field="AirIntakeLadRad" label="Air Intake LAD/RAD" />
                <StatusField field="coolantLevelColor" label="Coolant Level Color" />
              </div>
            </FormSection>

            {/* Light Engine Test */}
            <FormSection title="Light Engine Test">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusField field="lightEngineWhite" label="Light Engine White" />
                <StatusField field="lightEngineRed" label="Light Engine Red" />
                <StatusField field="lightEngineGreen" label="Light Engine Green" />
                <StatusField field="lightEngineBlue" label="Light Engine Blue" />
                <StatusField field="lightEngineBlack" label="Light Engine Black" />
              </div>
            </FormSection>

            {/* Mechanical Fields */}
            <FormSection title="Mechanical Components">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusField field="acBlowerVane" label="AC Blower Vane" />
                <StatusField field="extractorVane" label="Extractor Vane" />
                <FormField label="Exhaust CFM">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={formData.exhaustCfm || ""}
                      onChange={(e) => updateField("exhaustCfm", e.target.value)}
                      placeholder="Value"
                      className="border-2 border-black text-sm"
                    />
                    <Input
                      value={formData.exhaustCfmNote || ""}
                      onChange={(e) => updateField("exhaustCfmNote", e.target.value)}
                      placeholder="Note"
                      className="border-2 border-black text-sm"
                    />
                  </div>
                </FormField>
                <StatusField field="lightEngineFans" label="Light Engine Fans" />
                <StatusField field="cardCageFans" label="Card Cage Fans" />
                <StatusField field="radiatorFanPump" label="Radiator Fan Pump" />
                <StatusField field="pumpConnectorHose" label="Pump Connector Hose" />
                <StatusField field="securityLampHouseLock" label="Security Lamp House Lock" />
                <StatusField field="lampLocMechanism" label="Lamp LOC Mechanism" />
              </div>
            </FormSection>

            {/* Color Accuracy - White */}
            <FormSection title="Color Accuracy - White (MCGD Data)">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <FormField label="White 2K X">
                  <Input
                    type="number"
                    value={formData.white2Kx || ""}
                    onChange={(e) => updateField("white2Kx", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="White 2K Y">
                  <Input
                    type="number"
                    value={formData.white2Ky || ""}
                    onChange={(e) => updateField("white2Ky", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="White 2K fL">
                  <Input
                    type="number"
                    value={formData.white2Kfl || ""}
                    onChange={(e) => updateField("white2Kfl", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="White 4K X">
                  <Input
                    type="number"
                    value={formData.white4Kx || ""}
                    onChange={(e) => updateField("white4Kx", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="White 4K Y">
                  <Input
                    type="number"
                    value={formData.white4Ky || ""}
                    onChange={(e) => updateField("white4Ky", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="White 4K fL">
                  <Input
                    type="number"
                    value={formData.white4Kfl || ""}
                    onChange={(e) => updateField("white4Kfl", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Color Accuracy - Red */}
            <FormSection title="Color Accuracy - Red (MCGD Data)">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <FormField label="Red 2K X">
                  <Input
                    type="number"
                    value={formData.red2Kx || ""}
                    onChange={(e) => updateField("red2Kx", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Red 2K Y">
                  <Input
                    type="number"
                    value={formData.red2Ky || ""}
                    onChange={(e) => updateField("red2Ky", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Red 2K fL">
                  <Input
                    type="number"
                    value={formData.red2Kfl || ""}
                    onChange={(e) => updateField("red2Kfl", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Red 4K X">
                  <Input
                    type="number"
                    value={formData.red4Kx || ""}
                    onChange={(e) => updateField("red4Kx", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Red 4K Y">
                  <Input
                    type="number"
                    value={formData.red4Ky || ""}
                    onChange={(e) => updateField("red4Ky", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Red 4K fL">
                  <Input
                    type="number"
                    value={formData.red4Kfl || ""}
                    onChange={(e) => updateField("red4Kfl", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Color Accuracy - Green */}
            <FormSection title="Color Accuracy - Green (MCGD Data)">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <FormField label="Green 2K X">
                  <Input
                    type="number"
                    value={formData.green2Kx || ""}
                    onChange={(e) => updateField("green2Kx", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Green 2K Y">
                  <Input
                    type="number"
                    value={formData.green2Ky || ""}
                    onChange={(e) => updateField("green2Ky", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Green 2K fL">
                  <Input
                    type="number"
                    value={formData.green2Kfl || ""}
                    onChange={(e) => updateField("green2Kfl", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Green 4K X">
                  <Input
                    type="number"
                    value={formData.green4Kx || ""}
                    onChange={(e) => updateField("green4Kx", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Green 4K Y">
                  <Input
                    type="number"
                    value={formData.green4Ky || ""}
                    onChange={(e) => updateField("green4Ky", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Green 4K fL">
                  <Input
                    type="number"
                    value={formData.green4Kfl || ""}
                    onChange={(e) => updateField("green4Kfl", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Color Accuracy - Blue */}
            <FormSection title="Color Accuracy - Blue (MCGD Data)">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <FormField label="Blue 2K X">
                  <Input
                    type="number"
                    value={formData.blue2Kx || ""}
                    onChange={(e) => updateField("blue2Kx", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Blue 2K Y">
                  <Input
                    type="number"
                    value={formData.blue2Ky || ""}
                    onChange={(e) => updateField("blue2Ky", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Blue 2K fL">
                  <Input
                    type="number"
                    value={formData.blue2Kfl || ""}
                    onChange={(e) => updateField("blue2Kfl", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Blue 4K X">
                  <Input
                    type="number"
                    value={formData.blue4Kx || ""}
                    onChange={(e) => updateField("blue4Kx", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Blue 4K Y">
                  <Input
                    type="number"
                    value={formData.blue4Ky || ""}
                    onChange={(e) => updateField("blue4Ky", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Blue 4K fL">
                  <Input
                    type="number"
                    value={formData.blue4Kfl || ""}
                    onChange={(e) => updateField("blue4Kfl", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* CIE XYZ Data */}
            <FormSection title="CIE XYZ Data (BW Step 10)">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <FormField label="BW 2K X">
                  <Input
                    type="number"
                    value={formData.BW_Step_10_2Kx || ""}
                    onChange={(e) => updateField("BW_Step_10_2Kx", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="BW 2K Y">
                  <Input
                    type="number"
                    value={formData.BW_Step_10_2Ky || ""}
                    onChange={(e) => updateField("BW_Step_10_2Ky", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="BW 2K fL">
                  <Input
                    type="number"
                    value={formData.BW_Step_10_2Kfl || ""}
                    onChange={(e) => updateField("BW_Step_10_2Kfl", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="BW 4K X">
                  <Input
                    type="number"
                    value={formData.BW_Step_10_4Kx || ""}
                    onChange={(e) => updateField("BW_Step_10_4Kx", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="BW 4K Y">
                  <Input
                    type="number"
                    value={formData.BW_Step_10_4Ky || ""}
                    onChange={(e) => updateField("BW_Step_10_4Ky", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="BW 4K fL">
                  <Input
                    type="number"
                    value={formData.BW_Step_10_4Kfl || ""}
                    onChange={(e) => updateField("BW_Step_10_4Kfl", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Image Evaluation */}
            <FormSection title="Image Evaluation">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Focus/Boresight OK">
                  <Checkbox
                    checked={formData.focusBoresight || false}
                    onCheckedChange={(checked) => updateField("focusBoresight", checked)}
                  />
                </FormField>
                <FormField label="Integrator Position OK">
                  <Checkbox
                    checked={formData.integratorPosition || false}
                    onCheckedChange={(checked) => updateField("integratorPosition", checked)}
                  />
                </FormField>
                <FormField label="Spots on Screen OK">
                  <Checkbox
                    checked={formData.spotsOnScreen || false}
                    onCheckedChange={(checked) => updateField("spotsOnScreen", checked)}
                  />
                </FormField>
                <FormField label="Screen Cropping OK">
                  <Checkbox
                    checked={formData.screenCroppingOk || false}
                    onCheckedChange={(checked) => updateField("screenCroppingOk", checked)}
                  />
                </FormField>
                <FormField label="Convergence OK">
                  <Checkbox
                    checked={formData.convergenceOk || false}
                    onCheckedChange={(checked) => updateField("convergenceOk", checked)}
                  />
                </FormField>
                <FormField label="Channels Checked OK">
                  <Checkbox
                    checked={formData.channelsCheckedOk || false}
                    onCheckedChange={(checked) => updateField("channelsCheckedOk", checked)}
                  />
                </FormField>
                <FormField label="Pixel Defects">
                  <Input
                    value={formData.pixelDefects || ""}
                    onChange={(e) => updateField("pixelDefects", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Image Vibration">
                  <Input
                    value={formData.imageVibration || ""}
                    onChange={(e) => updateField("imageVibration", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="LiteLOC">
                  <Input
                    value={formData.liteloc || ""}
                    onChange={(e) => updateField("liteloc", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Air Pollution Data */}
            <FormSection title="Air Pollution Data">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Air Pollution Level">
                  <Input
                    value={formData.airPollutionLevel || ""}
                    onChange={(e) => updateField("airPollutionLevel", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="HCHO">
                  <Input
                    type="number"
                    value={formData.hcho || ""}
                    onChange={(e) => updateField("hcho", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="TVOC">
                  <Input
                    type="number"
                    value={formData.tvoc || ""}
                    onChange={(e) => updateField("tvoc", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="PM1">
                  <Input
                    type="number"
                    value={formData.pm1 || ""}
                    onChange={(e) => updateField("pm1", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="PM2.5">
                  <Input
                    type="number"
                    value={formData.pm2_5 || ""}
                    onChange={(e) => updateField("pm2_5", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="PM10">
                  <Input
                    type="number"
                    value={formData.pm10 || ""}
                    onChange={(e) => updateField("pm10", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Temperature">
                  <Input
                    type="number"
                    value={formData.temperature || ""}
                    onChange={(e) => updateField("temperature", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
                <FormField label="Humidity">
                  <Input
                    type="number"
                    value={formData.humidity || ""}
                    onChange={(e) => updateField("humidity", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Remarks & Other */}
            <FormSection title="Remarks & Other">
              <div className="grid grid-cols-1 gap-4">
                <FormField label="Remarks">
                  <textarea
                    value={formData.remarks || ""}
                    onChange={(e) => updateField("remarks", e.target.value)}
                    className="w-full border-2 border-black p-2 min-h-[100px]"
                    rows={4}
                  />
                </FormField>
                <FormField label="Photos Drive Link">
                  <Input
                    value={formData.photosDriveLink || ""}
                    onChange={(e) => updateField("photosDriveLink", e.target.value)}
                    className="border-2 border-black"
                  />
                </FormField>
              </div>
            </FormSection>

            <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading} className="bg-black text-white">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading service data...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Preview & Download Dialog Component
function PreviewDownloadDialog({
  open,
  onOpenChange,
  serviceId,
  onClose,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceId: string | null
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [serviceData, setServiceData] = useState<any>(null)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (open && serviceId) {
      const fetchService = async () => {
        try {
          const res = await fetch(`/api/admin/service-records/${serviceId}`, {
            credentials: "include",
          })
          if (res.ok) {
            const json = await res.json()
            setServiceData(json.service || json)
          }
        } catch (error) {
          console.error("Failed to fetch service:", error)
        }
      }
      fetchService()
    }
  }, [open, serviceId])

  const handleDownloadPDF = async () => {
    if (!serviceId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/service-records/${serviceId}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch service")
      const json = await res.json()
      const fullService = json.service || json

      const mapStatus = (value?: string | null, note?: string | null) => ({
        status: note ? String(note) : "",
        yesNo: value ? String(value) : "",
      })

      const reportData: MaintenanceReportData = {
        cinemaName: fullService.cinemaName || fullService.site?.name || "",
        date: fullService.date ? new Date(fullService.date).toLocaleDateString() : "",
        address: fullService.address || fullService.site?.address || "",
        contactDetails: fullService.contactDetails || fullService.site?.contactDetails || "",
        location: fullService.location || "",
        screenNo: fullService.screenNumber || fullService.site?.screenNo || "",
        serviceVisit: fullService.serviceNumber?.toString() || "",
        projectorModel: fullService.projector?.model || "",
        serialNo: fullService.projector?.serialNo || "",
        runningHours: fullService.projectorRunningHours?.toString() || "",
        projectorEnvironment: fullService.workDetails?.projectorPlacementEnvironment || "",
        startTime: fullService.workDetails?.startTime,
        endTime: fullService.workDetails?.endTime,
        opticals: {
          reflector: mapStatus(fullService.workDetails?.reflector, fullService.workDetails?.reflectorNote),
          uvFilter: mapStatus(fullService.workDetails?.uvFilter, fullService.workDetails?.uvFilterNote),
          integratorRod: mapStatus(fullService.workDetails?.integratorRod, fullService.workDetails?.integratorRodNote),
          coldMirror: mapStatus(fullService.workDetails?.coldMirror, fullService.workDetails?.coldMirrorNote),
          foldMirror: mapStatus(fullService.workDetails?.foldMirror, fullService.workDetails?.foldMirrorNote),
        },
        electronics: {
          touchPanel: mapStatus(fullService.workDetails?.touchPanel, fullService.workDetails?.touchPanelNote),
          evbBoard: mapStatus(fullService.workDetails?.evbBoard, fullService.workDetails?.evbBoardNote),
          ImcbBoard: mapStatus(fullService.workDetails?.ImcbBoard, fullService.workDetails?.ImcbBoardNote),
          pibBoard: mapStatus(fullService.workDetails?.pibBoard, fullService.workDetails?.pibBoardNote),
          IcpBoard: mapStatus(fullService.workDetails?.IcpBoard, fullService.workDetails?.IcpBoardNote),
          imbSBoard: mapStatus(fullService.workDetails?.imbSBoard, fullService.workDetails?.imbSBoardNote),
        },
        serialVerified: mapStatus(fullService.workDetails?.serialNumberVerified, fullService.workDetails?.serialNumberVerifiedNote),
        AirIntakeLadRad: mapStatus(fullService.workDetails?.AirIntakeLadRad, fullService.workDetails?.AirIntakeLadRadNote),
        coolant: mapStatus(fullService.workDetails?.coolantLevelColor, fullService.workDetails?.coolantLevelColorNote),
        lightEngineTest: {
          white: mapStatus(fullService.workDetails?.lightEngineWhite, fullService.workDetails?.lightEngineWhiteNote),
          red: mapStatus(fullService.workDetails?.lightEngineRed, fullService.workDetails?.lightEngineRedNote),
          green: mapStatus(fullService.workDetails?.lightEngineGreen, fullService.workDetails?.lightEngineGreenNote),
          blue: mapStatus(fullService.workDetails?.lightEngineBlue, fullService.workDetails?.lightEngineBlueNote),
          black: mapStatus(fullService.workDetails?.lightEngineBlack, fullService.workDetails?.lightEngineBlackNote),
        },
        mechanical: {
          acBlower: mapStatus(fullService.workDetails?.acBlowerVane, fullService.workDetails?.acBlowerVaneNote),
          extractor: mapStatus(fullService.workDetails?.extractorVane, fullService.workDetails?.extractorVaneNote),
          exhaustCFM: mapStatus(fullService.workDetails?.exhaustCfm, fullService.workDetails?.exhaustCfmNote),
          lightEngine4Fans: mapStatus(fullService.workDetails?.lightEngineFans, fullService.workDetails?.lightEngineFansNote),
          cardCageFans: mapStatus(fullService.workDetails?.cardCageFans, fullService.workDetails?.cardCageFansNote),
          radiatorFan: mapStatus(fullService.workDetails?.radiatorFanPump, fullService.workDetails?.radiatorFanPumpNote),
          connectorHose: mapStatus(fullService.workDetails?.pumpConnectorHose, fullService.workDetails?.pumpConnectorHoseNote),
          securityLock: mapStatus(fullService.workDetails?.securityLampHouseLock, fullService.workDetails?.securityLampHouseLockNote),
        },
        lampLOC: mapStatus(fullService.workDetails?.lampLocMechanism, fullService.workDetails?.lampLocMechanismNote),
        lampMake: fullService.workDetails?.lampMakeModel || "",
        lampHours: fullService.workDetails?.lampTotalRunningHours?.toString() || "",
        currentLampHours: fullService.workDetails?.lampCurrentRunningHours?.toString() || "",
        voltageParams: {
          pvn: fullService.workDetails?.pvVsN || "",
          pve: fullService.workDetails?.pvVsE || "",
          nve: fullService.workDetails?.nvVsE || "",
        },
        flBefore: fullService.workDetails?.flLeft?.toString() || "",
        flAfter: fullService.workDetails?.flRight?.toString() || "",
        contentPlayer: fullService.workDetails?.contentPlayerModel || "",
        acStatus: fullService.workDetails?.acStatus || "",
        leStatus: fullService.workDetails?.leStatus || "",
        remarks: fullService.remarks || "",
        leSerialNo: fullService.workDetails?.lightEngineSerialNumber || "",
        mcgdData: {
          white2K: {
            fl: fullService.workDetails?.white2Kfl?.toString() || "",
            x: fullService.workDetails?.white2Kx?.toString() || "",
            y: fullService.workDetails?.white2Ky?.toString() || "",
          },
          white4K: {
            fl: fullService.workDetails?.white4Kfl?.toString() || "",
            x: fullService.workDetails?.white4Kx?.toString() || "",
            y: fullService.workDetails?.white4Ky?.toString() || "",
          },
          red2K: {
            fl: fullService.workDetails?.red2Kfl?.toString() || "",
            x: fullService.workDetails?.red2Kx?.toString() || "",
            y: fullService.workDetails?.red2Ky?.toString() || "",
          },
          red4K: {
            fl: fullService.workDetails?.red4Kfl?.toString() || "",
            x: fullService.workDetails?.red4Kx?.toString() || "",
            y: fullService.workDetails?.red4Ky?.toString() || "",
          },
          green2K: {
            fl: fullService.workDetails?.green2Kfl?.toString() || "",
            x: fullService.workDetails?.green2Kx?.toString() || "",
            y: fullService.workDetails?.green2Ky?.toString() || "",
          },
          green4K: {
            fl: fullService.workDetails?.green4Kfl?.toString() || "",
            x: fullService.workDetails?.green4Kx?.toString() || "",
            y: fullService.workDetails?.green4Ky?.toString() || "",
          },
          blue2K: {
            fl: fullService.workDetails?.blue2Kfl?.toString() || "",
            x: fullService.workDetails?.blue2Kx?.toString() || "",
            y: fullService.workDetails?.blue2Ky?.toString() || "",
          },
          blue4K: {
            fl: fullService.workDetails?.blue4Kfl?.toString() || "",
            x: fullService.workDetails?.blue4Kx?.toString() || "",
            y: fullService.workDetails?.blue4Ky?.toString() || "",
          },
        },
        cieXyz2K: {
          x: fullService.workDetails?.BW_Step_10_2Kx?.toString() || "",
          y: fullService.workDetails?.BW_Step_10_2Ky?.toString() || "",
          fl: fullService.workDetails?.BW_Step_10_2Kfl?.toString() || "",
        },
        cieXyz4K: {
          x: fullService.workDetails?.BW_Step_10_4Kx?.toString() || "",
          y: fullService.workDetails?.BW_Step_10_4Ky?.toString() || "",
          fl: fullService.workDetails?.BW_Step_10_4Kfl?.toString() || "",
        },
        softwareVersion: fullService.workDetails?.softwareVersion || "",
        screenInfo: {
          scope: {
            height: fullService.workDetails?.screenHeight?.toString() || "",
            width: fullService.workDetails?.screenWidth?.toString() || "",
            gain: fullService.workDetails?.screenGain?.toString() || "",
          },
          flat: {
            height: fullService.workDetails?.flatHeight?.toString() || "",
            width: fullService.workDetails?.flatWidth?.toString() || "",
            gain: fullService.workDetails?.screenGain?.toString() || "",
          },
          make: fullService.workDetails?.screenMake || "",
        },
        throwDistance: fullService.workDetails?.throwDistance?.toString() || "",
        imageEvaluation: {
          focusBoresite: fullService.workDetails?.focusBoresight ? "Yes" : "No",
          integratorPosition: fullService.workDetails?.integratorPosition ? "Yes" : "No",
          spotOnScreen: fullService.workDetails?.spotsOnScreen ? "Yes" : "No",
          screenCropping: fullService.workDetails?.screenCroppingOk ? "Yes" : "No",
          convergence: fullService.workDetails?.convergenceOk ? "Yes" : "No",
          channelsChecked: fullService.workDetails?.channelsCheckedOk ? "Yes" : "No",
          pixelDefects: fullService.workDetails?.pixelDefects || "",
          imageVibration: fullService.workDetails?.imageVibration || "",
          liteLOC: fullService.workDetails?.liteloc || "",
        },
        airPollution: {
          airPollutionLevel: fullService.workDetails?.airPollutionLevel || "",
          hcho: fullService.workDetails?.hcho?.toString() || "",
          tvoc: fullService.workDetails?.tvoc?.toString() || "",
          pm10: fullService.workDetails?.pm10?.toString() || "",
          pm25: fullService.workDetails?.pm2_5?.toString() || "",
          pm100: fullService.workDetails?.pm1?.toString() || "",
          temperature: fullService.workDetails?.temperature?.toString() || "",
          humidity: fullService.workDetails?.humidity?.toString() || "",
        },
        recommendedParts: Array.isArray(fullService.workDetails?.recommendedParts)
          ? fullService.workDetails.recommendedParts.map((part: any) => ({
              name: String(part.name ?? part.description ?? ""),
              partNumber: String(part.partNumber ?? part.part_number ?? ""),
            }))
          : [],
        issueNotes: [],
        detectedIssues: [],
        reportGenerated: true,
        reportUrl: "",
        engineerSignatureUrl:
          fullService.signatures?.engineer || (fullService.signatures as any)?.engineerSignatureUrl || "",
        siteSignatureUrl: fullService.signatures?.site || (fullService.signatures as any)?.siteSignatureUrl || "",
      }

      const pdfBytes = await generateMaintenanceReport(reportData)
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Service_Report_${fullService.serviceNumber ?? serviceId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address")
      return
    }
    // TODO: Implement email sending functionality
    alert(`Email functionality will be implemented later. Would send PDF to: ${email}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview & Download Report</DialogTitle>
        </DialogHeader>
        {serviceData ? (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Email Address (for sending PDF)</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="border-2 border-black"
              />
            </div>
            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-lg">Service Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Service #:</span> {serviceData.serviceNumber}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {serviceData.date ? new Date(serviceData.date).toLocaleDateString() : "N/A"}
                </div>
                <div>
                  <span className="font-medium">Cinema:</span> {serviceData.cinemaName || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Projector Model:</span> {serviceData.projector?.model || "N/A"}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleDownloadPDF} disabled={loading} className="bg-black text-white">
                {loading ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={!email || loading}
                className="bg-black text-white"
              >
                Send Email
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading service data...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

type OverviewViewProps = {
  hideHeader?: boolean
  limit?: number
}

export default function OverviewView({ hideHeader, limit }: OverviewViewProps) {
  const [records, setRecords] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [workerFilter, setWorkerFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [columnKeys, setColumnKeys] = useState<string[]>([])
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})
  const [page, setPage] = useState(1)
  const pageSize = limit ?? 20
  const [columnMenuOpen, setColumnMenuOpen] = useState(false)
  const [columnSearch, setColumnSearch] = useState("")
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [previewTitle, setPreviewTitle] = useState("")
  const [expandedRemarks, setExpandedRemarks] = useState<Record<string, boolean>>({})
  const [signaturePreviewOpen, setSignaturePreviewOpen] = useState(false)
  const [signatureUrls, setSignatureUrls] = useState<{ site?: string; engineer?: string }>({})
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewServiceId, setPreviewServiceId] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        setError(null)
        // Fetch all service records; try multiple endpoints in order, tolerate missing ones.
        const tryEndpoints = [
          "/api/admin/tasks",
        ]
        let json: any = null
        let success = false
        let lastErr: string | null = null

        for (const endpoint of tryEndpoints) {
          try {
            const res = await fetch(endpoint, { credentials: "include" })
            if (!res.ok) {
              lastErr = `${endpoint} -> ${res.status} ${res.statusText}`
              continue
            }
            json = await res.json()
            success = true
            break
          } catch (err) {
            lastErr = `${endpoint} -> ${(err as Error).message}`
            continue
          }
        }

        if (!success || !json) {
          setRecords([])
          setError("Failed to fetch service records" + (lastErr ? ` (${lastErr})` : ""))
          return
        }

        const tasks = Array.isArray(json) ? json : json.tasks || json.data || []
        const items: ServiceRecord[] = tasks.map((item: any, idx: number) => {
          const projector = item.projector ?? {}
          const site = item.site ?? {}

          const flattened: ServiceRecord = {
            id: item.id ?? `row-${idx}`,
            ...item,
            action: item.id ?? `row-${idx}`,
            engineerVisited: item.engineerVisited ?? item.user?.name ?? "",
            projectorModel: item.modelNo ?? projector.modelNo ?? item.projectorModel ?? "",
            projectorSerial: item.serialNo ?? projector.serialNo ?? item.projectorSerial ?? "",
            projectorStatus: projector.status ?? "",
            projectorServices: projector.noOfservices ?? "",
            siteName: site.siteName ?? item.siteName ?? "",
            siteCode: site.siteCode ?? "",
            siteAddress: site.address ?? item.address ?? "",
            siteContactDetails: site.contactDetails ?? item.contactDetails ?? "",
          }

          // Merge note fields with their parent fields
          Object.entries(NOTE_FIELD_MAP).forEach(([parentKey, noteKey]) => {
            const parentValue = flattened[parentKey]
            const noteValue = flattened[noteKey]
            if (parentValue || noteValue) {
              if (noteValue) {
                flattened[parentKey] = `${parentValue || ""}${parentValue && noteValue ? " - " : ""}${noteValue}`
              }
              // Keep note field for completeness but avoid duplicate columns
              EXCLUDED_KEYS.add(noteKey)
            }
          })

          // Remove nested objects and excluded fields
          delete flattened.projector
          delete flattened.site
          delete flattened.assignedToId
          delete flattened.createdAt
          delete flattened.userId

          return flattened
        })

        setRecords(items)
        const allKeys = Array.from(
          new Set(
            items
              .flatMap((r) => Object.keys(r))
              .filter((k) => !EXCLUDED_KEYS.has(k)),
          ),
        )
        
        // Sort by priority: priority fields first, then alphabetically
        const derivedKeys = allKeys.sort((a, b) => {
          const aPriority = COLUMN_PRIORITY.indexOf(a)
          const bPriority = COLUMN_PRIORITY.indexOf(b)
          if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority
          if (aPriority !== -1) return -1
          if (bPriority !== -1) return 1
          return a.localeCompare(b)
        })
        
        setColumnKeys(derivedKeys)
        setVisibleColumns((prev) => {
          if (Object.keys(prev).length) return prev
          return derivedKeys.reduce(
            (acc, key) => ({
              ...acc,
              [key]: true,
            }),
            {} as Record<string, boolean>,
          )
        })
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Failed to load records")
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [])


  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase()
    const start = startDate ? new Date(startDate) : null

    const inRange = (d?: string | null) => {
      if (!d) return true
      const dateVal = new Date(d)
      if (Number.isNaN(dateVal.getTime())) return true
      if (start && dateVal < start) return false
      return true
    }

    const matchesSearch = (r: ServiceRecord) =>
      !lower ||
      columnKeys
        .filter((key) => visibleColumns[key]) // search only visible columns to match user view
        .some((key) => {
          const val = r[key]
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(lower)
        })

    const matchesWorker = (rec: ServiceRecord) => workerFilter === "all" || rec.workerName === workerFilter

    return records
      .filter((rec) => matchesWorker(rec) && matchesSearch(rec) && inRange(rec.date || rec.scheduledDate || rec.createdAt))
      .sort((a, b) => {
        const aDate = a.date || a.scheduledDate || a.createdAt
        const bDate = b.date || b.scheduledDate || b.createdAt
        const aTime = aDate ? new Date(aDate).getTime() : 0
        const bTime = bDate ? new Date(bDate).getTime() : 0
        return bTime - aTime // descending newest first
      })
  }, [records, search, workerFilter, startDate])

  useEffect(() => {
    setPage(1)
  }, [search, workerFilter, startDate])

  const totalPages = limit ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageData = limit ? filtered.slice(0, limit) : filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const setAllColumns = (checked: boolean) => {
    setVisibleColumns((prev) =>
      columnKeys.reduce(
        (acc, key) => ({
          ...acc,
          [key]: checked,
        }),
        { ...prev },
      ),
    )
  }

  const dateLikeKeys = new Set([
    "date",
    "completedAt",
    "scheduledDate",
    "createdAt",
    "updatedAt",
    "startTime",
    "endTime",
  ])

  const handleImageClick = (images: string[], title: string) => {
    setPreviewImages(images)
    setPreviewTitle(title)
    setImagePreviewOpen(true)
  }

  const handleSignatureClick = (signatures: any) => {
    try {
      const sigs = typeof signatures === "string" ? JSON.parse(signatures) : signatures
      setSignatureUrls({
        site: sigs?.site || sigs?.siteSignatureUrl,
        engineer: sigs?.engineer || sigs?.engineerSignatureUrl,
      })
      setSignaturePreviewOpen(true)
    } catch {
      setSignatureUrls({})
      setSignaturePreviewOpen(true)
    }
  }

  const toggleRemarks = (rowId: string) => {
    setExpandedRemarks((prev) => ({ ...prev, [rowId]: !prev[rowId] }))
  }


  const formatValue = (key: string, value: any, rowId: string) => {
    if (value === null || value === undefined) return "—"
    
    // Handle download action
    if (key === "action") {
      return (
        <div className="flex gap-2">
        <button
          onClick={() => {
            setPreviewServiceId(rowId)
            setPreviewDialogOpen(true)
          }}
          className="inline-flex gap-4 rounded-md items-center justify-center text-white bg-black p-2 w-full transition-colors"
          title="Preview & Download PDF"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setEditingServiceId(rowId)
            setEditDialogOpen(true)
          }}
          className="inline-flex gap-4 rounded-md items-center justify-center text-white bg-black p-2 w-full transition-colors"
          title="Edit Service Record"
        >
          <Edit className="h-4 w-4" />
        </button>
        </div>
      )
    }
    
    // Handle signatures
    if (key === "signatures" && value) {
      const hasSignatures = typeof value === "object" || (typeof value === "string" && value.includes("http"))
      if (hasSignatures) {
        return (
          <button
            onClick={() => handleSignatureClick(value)}
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ImageIcon className="h-4 w-4" />
            <span>View</span>
          </button>
        )
      }
      return "—"
    }
    
    // Handle remarks with expand/collapse
    if (key === "remarks" && typeof value === "string" && value) {
      const isExpanded = expandedRemarks[rowId]
      const maxLength = 50
      const shouldTruncate = value.length > maxLength
      
      return (
        <button
          onClick={() => toggleRemarks(rowId)}
          className="text-left hover:text-blue-600 transition-colors"
          title={shouldTruncate ? "Click to expand/collapse" : ""}
        >
          {shouldTruncate && !isExpanded ? `${value.substring(0, maxLength)}...` : value}
        </button>
      )
    }
    
    // Handle fields with notes (merged format: "OK - Note")
    if (NOTE_FIELD_MAP[key] && typeof value === "string") {
      const parts = value.split(" - ")
      const mainValue = parts[0] || ""
      const noteValue = parts.slice(1).join(" - ") || ""
      
      if (!noteValue) {
        return <span>{mainValue || "—"}</span>
      }
      
      return (
        <div className="flex flex-col items-start gap-1">
          <span>{mainValue}</span>
          <span className="text-gray-600 text-xs bg-gray-200 p-2 rounded-sm">{noteValue}</span>
        </div>
      )
    }
    
    // Handle image arrays
    if (key === "images" && Array.isArray(value) && value.length > 0) {
      return (
        <button
          onClick={() => handleImageClick(value, "Images")}
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline"
        >
          <ImageIcon className="h-4 w-4" />
          <span>{value.length} image{value.length !== 1 ? "s" : ""}</span>
        </button>
      )
    }
    
    if (key === "brokenImages" && Array.isArray(value) && value.length > 0) {
      return (
        <button
          onClick={() => handleImageClick(value, "Broken Images")}
          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 hover:underline"
        >
          <ImageIcon className="h-4 w-4" />
          <span>{value.length} broken</span>
        </button>
      )
    }
    
    // Handle drive link
    if (key === "photosDriveLink" && typeof value === "string" && value) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline"
        >
          <Folder className="h-4 w-4" />
          <span>Drive</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )
    }
    
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (Array.isArray(value)) return value.length > 0 ? `${value.length} items` : "—"
    if (typeof value === "object") return JSON.stringify(value)
    if (dateLikeKeys.has(key) && typeof value === "string") return formatDate(value)
    return String(value)
  }

  return (
    <div className="space-y-4 ">
      <Card className={`rounded-none  border-none ${hideHeader && "p-0"}`}>
        {!hideHeader && (
          <CardHeader className="flex flex-col gap-3">
            <CardTitle className="text-lg font-semibold text-black">Service Records</CardTitle>
            <div className="flex flex-col w-full gap-3 border-b-2 pb-4">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Search site, projector, model, worker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-2 border-black text-sm flex-1 min-w-[200px]"
              />
              <Popover open={columnMenuOpen} onOpenChange={setColumnMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-black text-sm"
                  >
                    Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-96 overflow-hidden rounded-md border-2 border-black bg-white shadow-lg">
                  <div className="p-3 space-y-2">
                    <Input
                      placeholder="Search columns..."
                      value={columnSearch}
                      onChange={(e) => setColumnSearch(e.target.value)}
                      className="border-2 border-black text-sm"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Toggle visibility</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-black"
                        onClick={() => {
                          const allSelected = columnKeys.every((k) => visibleColumns[k])
                          setAllColumns(!allSelected)
                        }}
                      >
                        {columnKeys.every((k) => visibleColumns[k]) ? "Deselect all" : "Select all"}
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto border-t border-black/20">
                    {columnKeys
                      .filter((key) => toLabel(key).toLowerCase().includes(columnSearch.toLowerCase()))
                      .map((key) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-black hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={visibleColumns[key]}
                            onCheckedChange={() => toggleColumn(key as any)}
                            className="border-black"
                          />
                          {toLabel(key)}
                        </label>
                      ))}
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-2 border-black text-sm w-fit justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? formatDate(startDate) : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(formatIsoDate(date))
                      } else {
                        setStartDate("")
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                className="border-2 border-black text-sm"
                onClick={() => {
                  setSearch("")
                  setWorkerFilter("all")
                  setStartDate("")
                  setPage(1)
                }}
              >
                Reset filters
              </Button>
            </div>
            </div>
            </div>
          </CardHeader>
        )}
        <CardContent className={`overflow-x-auto ${hideHeader && "px-0"}`}>
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-600">Loading records...</div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-600">No records found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columnKeys.filter((k) => visibleColumns[k]).map((key) => (
                    <th key={key} className="text-left whitespace-nowrap py-3 px-4 font-semibold text-black">
                      {toLabel(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    {columnKeys.filter((k) => visibleColumns[k]).map((key) => (
                      <td key={key} className="py-3 px-4 whitespace-nowrap text-black">
                        {formatValue(key, row[key], row.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
        {!loading && filtered.length > 0 && !limit && (
          <div className="flex items-center justify-between px-6 pb-4 text-sm text-black">
            <span>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-black"
              >
                Prev
              </Button>
              <span>
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="border-black"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {previewImages.map((imageUrl, idx) => (
              <div key={idx} className="relative aspect-square border border-gray-200 rounded overflow-hidden bg-gray-50">
                <Image
                  src={imageUrl}
                  alt={`${previewTitle} ${idx + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform cursor-pointer"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  onClick={() => window.open(imageUrl, "_blank")}
                />
              </div>
            ))}
          </div>
          {previewImages.length === 0 && (
            <p className="text-center text-gray-500 py-8">No images available</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Signature Preview Dialog */}
      <Dialog open={signaturePreviewOpen} onOpenChange={setSignaturePreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Signatures</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {signatureUrls.site && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-700">Site Signature</h3>
                <div className="relative w-full h-32 border border-gray-200 rounded overflow-hidden bg-gray-50">
                  <Image
                    src={signatureUrls.site}
                    alt="Site Signature"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            )}
            {signatureUrls.engineer && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-700">Engineer Signature</h3>
                <div className="relative w-full h-32 border border-gray-200 rounded overflow-hidden bg-gray-50">
                  <Image
                    src={signatureUrls.engineer}
                    alt="Engineer Signature"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            )}
            {!signatureUrls.site && !signatureUrls.engineer && (
              <p className="text-center text-gray-500 py-8 col-span-2">No signatures available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <EditServiceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        serviceId={editingServiceId}
        onSuccess={() => {
          // Refresh records after successful edit
          const fetchRecords = async () => {
            try {
              const res = await fetch("/api/admin/tasks", { credentials: "include" })
              if (res.ok) {
                const json = await res.json()
                const tasks = Array.isArray(json) ? json : json.tasks || json.data || []
                const items: ServiceRecord[] = tasks.map((item: any, idx: number) => {
                  const projector = item.projector ?? {}
                  const site = item.site ?? {}
                  const flattened: ServiceRecord = {
                    id: item.id ?? `row-${idx}`,
                    ...item,
                    action: item.id ?? `row-${idx}`,
                    engineerVisited: item.engineerVisited ?? item.user?.name ?? "",
                    projectorModel: item.modelNo ?? projector.modelNo ?? item.projectorModel ?? "",
                    projectorSerial: item.serialNo ?? projector.serialNo ?? item.projectorSerial ?? "",
                    projectorStatus: projector.status ?? "",
                    projectorServices: projector.noOfservices ?? "",
                    siteName: site.siteName ?? item.siteName ?? "",
                    siteCode: site.siteCode ?? "",
                    siteAddress: site.address ?? item.address ?? "",
                    siteContactDetails: site.contactDetails ?? item.contactDetails ?? "",
                  }
                  Object.entries(NOTE_FIELD_MAP).forEach(([parentKey, noteKey]) => {
                    const parentValue = flattened[parentKey]
                    const noteValue = flattened[noteKey]
                    if (parentValue || noteValue) {
                      if (noteValue) {
                        flattened[parentKey] = `${parentValue || ""}${parentValue && noteValue ? " - " : ""}${noteValue}`
                      }
                      EXCLUDED_KEYS.add(noteKey)
                    }
                  })
                  delete flattened.projector
                  delete flattened.site
                  delete flattened.assignedToId
                  delete flattened.createdAt
                  delete flattened.userId
                  return flattened
                })
                setRecords(items)
              }
            } catch (error) {
              console.error("Failed to refresh records:", error)
            }
          }
          fetchRecords()
          setEditDialogOpen(false)
          setEditingServiceId(null)
        }}
      />

      {/* Preview & Download Dialog */}
      <PreviewDownloadDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        serviceId={previewServiceId}
        onClose={() => {
          setPreviewDialogOpen(false)
          setPreviewServiceId(null)
        }}
      />
    </div>
  )
}
