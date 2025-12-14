"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ArrowLeft, Download, ChevronRight, Search, CalendarIcon } from "lucide-react"

import { generateMaintenanceReport, convertServiceVisitToText, type MaintenanceReportData } from "@/components/PDFGenerator"

interface Service {
  id: string
  engineerName?: string
  serviceNumber: number
  site: {
    id: string
    name: string
    address: string | null
    contactDetails: string | null
    screenNo: string | null
  }
  projector: {
    id: string
    model: string
    serialNo: string
    runningHours: number | null
  }
  date: string | null
  completedAt: string | null
  cinemaName: string | null
  address: string | null
  location: string | null
  screenNumber: string | null
  contactDetails: string | null
  projectorRunningHours: number | null
  remarks: string | null
  images: string[]
  brokenImages: string[]
  signatures: any
  reportGenerated: boolean
  reportUrl: string | null
  workDetails: any
}

type ViewMode = "completed" | "pending"

export default function ServicesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("completed")

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
        return
      }
      fetchServices(viewMode)
    }
  }, [user, isLoading, router, viewMode])

  const fetchServices = async (mode: ViewMode) => {
    try {
      const endpoint =
        mode === "completed"
          ? "/api/user/services/completed"
          : "/api/user/services/pending"

      const response = await fetch(endpoint, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      } else {
        console.error(`Failed to fetch ${mode} services:`, response.statusText)
        setServices([])
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<Date>()

  const filteredServices = services.filter((service) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      service.site.name.toLowerCase().includes(query) ||
      service.projector.model.toLowerCase().includes(query) ||
      service.serviceNumber.toString().includes(query) ||
      (service.cinemaName && service.cinemaName.toLowerCase().includes(query)) ||
      (service.site.address && service.site.address.toLowerCase().includes(query)) ||
      (service.address && service.address.toLowerCase().includes(query))

    // Check if service date matches selected date (comparing YYYY-MM-DD parts)
    const matchesDate = dateFilter 
      ? service.date?.startsWith(format(dateFilter, "yyyy-MM-dd")) 
      : true

    return matchesSearch && matchesDate
  }).sort((a, b) => {
    const aDate = viewMode === "completed" ? a.completedAt : a.date
    const bDate = viewMode === "completed" ? b.completedAt : b.date
    return new Date(bDate || "").getTime() - new Date(aDate || "").getTime()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    )
  }

  if (selectedService) {
    return (
      <ServiceDetailView
        service={selectedService}
        onBack={() => setSelectedService(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="border-b-2 border-black p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 border-2 border-black hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black">
                {viewMode === "completed" ? "Completed Services" : "Pending Services"}
              </h1>
              <p className="text-gray-600 mt-2">
                {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""} found
                {services.length !== filteredServices.length && ` (filtered from ${services.length})`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search site, address, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-2 border-black focus-visible:ring-0"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-fit sm:w-[240px] justify-start text-left font-normal border-2 border-black",
                      !dateFilter && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                    captionLayout="dropdown"
                    className="rounded-md border shadow-sm"
                  />
                </PopoverContent>
              </Popover>
              <div className="flex rounded-md border-2 border-black overflow-hidden">
                <Button
                  type="button"
                  variant={viewMode === "completed" ? "default" : "ghost"}
                  className={`flex-1 rounded-none ${viewMode === "completed" ? "bg-black text-white" : "text-black"}`}
                  onClick={() => {
                    setLoading(true)
                    setViewMode("completed")
                  }}
                >
                  Completed
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "pending" ? "default" : "ghost"}
                  className={`flex-1 rounded-none ${viewMode === "pending" ? "bg-black text-white" : "text-black"}`}
                  onClick={() => {
                    setLoading(true)
                    setViewMode("pending")
                  }}
                >
                  Pending
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full">
        {filteredServices.length === 0 ? (
          <Card className="border-2 border-black">
            <CardContent className="p-12 text-center">
              <p className="text-lg text-gray-600">
                {services.length === 0
                  ? `No ${viewMode === "completed" ? "completed" : "pending"} services yet`
                  : "No services match your search"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="border-2 border-black hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedService(service)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-black">
                          Service 
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Site</p>
                          <p className="font-semibold text-black">{service.site.name}</p>
                          {service.site.address && (
                            <p className="text-gray-600 text-xs mt-1">{service.site.address}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Projector</p>
                          <p className="font-semibold text-black">
                            {service.projector.model} - {service.projector.serialNo}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Service Date</p>
                          <p className="font-semibold text-black">{formatDate(service.date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Completed</p>
                          <p className="font-semibold text-black">{formatDateTime(service.date)}</p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceDetailView({
  service,
  onBack,
}: {
  service: Service
  onBack: () => void
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  console.log("services here", service);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true)
      
      // Map DB status + note to PDF StatusItem:
      // - yesNo: raw status value from DB (e.g. OK / YES / NO)
      // - status: free-text note from the corresponding *Note field (or empty)
      const mapStatus = (value?: string | null, note?: string | null) => ({
        status: note ? String(note) : '',
        yesNo: value ? String(value) : '',
      })

      const reportData: MaintenanceReportData = {
        cinemaName: service.cinemaName || service.site.name || '',
        date: service.date ? new Date(service.date).toLocaleDateString() : '',
        address: service.address || service.site.address || '',
        contactDetails: service.contactDetails || service.site.contactDetails || '',
        location: service.location || '',
        screenNo: service.screenNumber || service.site.screenNo || '',
        serviceVisit: service.engineerName ? `${service.engineerName} - ${convertServiceVisitToText(service.serviceNumber)}` : service.serviceNumber.toString(),
        projectorModel: service.projector.model,
        serialNo: service.projector.serialNo,
        runningHours: service.projectorRunningHours?.toString() || '',
        projectorEnvironment: service.workDetails?.projectorPlacementEnvironment || '',
        startTime: service.workDetails?.startTime,
        endTime: service.workDetails?.endTime,
        
        opticals: {
          reflector: mapStatus(service.workDetails?.reflector, service.workDetails?.reflectorNote),
          uvFilter: mapStatus(service.workDetails?.uvFilter, service.workDetails?.uvFilterNote),
          integratorRod: mapStatus(service.workDetails?.integratorRod, service.workDetails?.integratorRodNote),
          coldMirror: mapStatus(service.workDetails?.coldMirror, service.workDetails?.coldMirrorNote),
          foldMirror: mapStatus(service.workDetails?.foldMirror, service.workDetails?.foldMirrorNote),
        },
        
        electronics: {
          touchPanel: mapStatus(service.workDetails?.touchPanel, service.workDetails?.touchPanelNote),
          evbBoard: mapStatus(service.workDetails?.evbBoard, service.workDetails?.evbBoardNote),
          ImcbBoard: mapStatus(service.workDetails?.ImcbBoard, service.workDetails?.ImcbBoardNote),
          pibBoard: mapStatus(service.workDetails?.pibBoard, service.workDetails?.pibBoardNote),
          IcpBoard: mapStatus(service.workDetails?.IcpBoard, service.workDetails?.IcpBoardNote),
          imbSBoard: mapStatus(service.workDetails?.imbSBoard, service.workDetails?.imbSBoardNote),
        },
        
        serialVerified: mapStatus(service.workDetails?.serialNumberVerified, service.workDetails?.serialNumberVerifiedNote),
        AirIntakeLadRad: mapStatus(service.workDetails?.AirIntakeLadRad, service.workDetails?.AirIntakeLadRadNote),
        coolant: mapStatus(service.workDetails?.coolantLevelColor, service.workDetails?.coolantLevelColorNote),
        
        lightEngineTest: {
          white: mapStatus(service.workDetails?.lightEngineWhite),
          red: mapStatus(service.workDetails?.lightEngineRed),
          green: mapStatus(service.workDetails?.lightEngineGreen),
          blue: mapStatus(service.workDetails?.lightEngineBlue),
          black: mapStatus(service.workDetails?.lightEngineBlack),
        },
        
        mechanical: {
          acBlower: mapStatus(service.workDetails?.acBlowerVane, service.workDetails?.acBlowerVaneNote),
          extractor: mapStatus(service.workDetails?.extractorVane, service.workDetails?.extractorVaneNote),
          exhaustCFM: mapStatus(service.workDetails?.exhaustCfm, service.workDetails?.exhaustCfmNote),
          lightEngine4Fans: mapStatus(service.workDetails?.lightEngineFans, service.workDetails?.lightEngineFansNote),
          cardCageFans: mapStatus(service.workDetails?.cardCageFans, service.workDetails?.cardCageFansNote),
          radiatorFan: mapStatus(service.workDetails?.radiatorFanPump, service.workDetails?.radiatorFanPumpNote),
          connectorHose: mapStatus(service.workDetails?.pumpConnectorHose, service.workDetails?.pumpConnectorHoseNote),
          securityLock: mapStatus(service.workDetails?.securityLampHouseLock),
        },
        
        lampLOC: mapStatus(service.workDetails?.lampLocMechanism, service.workDetails?.lampLocMechanismNote),
        
        lampMake: service.workDetails?.lampMakeModel || '',
        lampHours: service.workDetails?.lampTotalRunningHours?.toString() || '',
        currentLampHours: service.workDetails?.lampCurrentRunningHours?.toString() || '',
        
        voltageParams: {
          pvn: service.workDetails?.pvVsN || '',
          pve: service.workDetails?.pvVsE || '',
          nve: service.workDetails?.nvVsE || '',
        },
        
        flBefore: service.workDetails?.flLeft?.toString() || '', // Using flLeft as placeholder if flBefore not explicit
        flAfter: service.workDetails?.flRight?.toString() || '', // Using flRight as placeholder
        
        contentPlayer: service.workDetails?.contentPlayerModel || '',
        acStatus: service.workDetails?.acStatus || '',
        leStatus: service.workDetails?.leStatus || '',
        remarks: service.remarks || '',
        leSerialNo: service.workDetails?.lightEngineSerialNumber || '',
        
        mcgdData: {
          white2K: { fl: service.workDetails?.white2Kfl?.toString() || '', x: service.workDetails?.white2Kx?.toString() || '', y: service.workDetails?.white2Ky?.toString() || '' },
          white4K: { fl: service.workDetails?.white4Kfl?.toString() || '', x: service.workDetails?.white4Kx?.toString() || '', y: service.workDetails?.white4Ky?.toString() || '' },
          red2K: { fl: service.workDetails?.red2Kfl?.toString() || '', x: service.workDetails?.red2Kx?.toString() || '', y: service.workDetails?.red2Ky?.toString() || '' },
          red4K: { fl: service.workDetails?.red4Kfl?.toString() || '', x: service.workDetails?.red4Kx?.toString() || '', y: service.workDetails?.red4Ky?.toString() || '' },
          green2K: { fl: service.workDetails?.green2Kfl?.toString() || '', x: service.workDetails?.green2Kx?.toString() || '', y: service.workDetails?.green2Ky?.toString() || '' },
          green4K: { fl: service.workDetails?.green4Kfl?.toString() || '', x: service.workDetails?.green4Kx?.toString() || '', y: service.workDetails?.green4Ky?.toString() || '' },
          blue2K: { fl: service.workDetails?.blue2Kfl?.toString() || '', x: service.workDetails?.blue2Kx?.toString() || '', y: service.workDetails?.blue2Ky?.toString() || '' },
          blue4K: { fl: service.workDetails?.blue4Kfl?.toString() || '', x: service.workDetails?.blue4Kx?.toString() || '', y: service.workDetails?.blue4Ky?.toString() || '' },
        },
        
        cieXyz2K: {
          x: service.workDetails?.BW_Step_10_2Kx?.toString() || '',
          y: service.workDetails?.BW_Step_10_2Ky?.toString() || '',
          fl: service.workDetails?.BW_Step_10_2Kfl?.toString() || '',
        },
        cieXyz4K: {
          x: service.workDetails?.BW_Step_10_4Kx?.toString() || '',
          y: service.workDetails?.BW_Step_10_4Ky?.toString() || '',
          fl: service.workDetails?.BW_Step_10_4Kfl?.toString() || '',
        },
        
        softwareVersion: service.workDetails?.softwareVersion || '',
        
        screenInfo: {
          scope: { 
            height: service.workDetails?.screenHeight?.toString() || '', 
            width: service.workDetails?.screenWidth?.toString() || '', 
            gain: service.workDetails?.screenGain?.toString() || '' 
          },
          flat: { 
            height: service.workDetails?.flatHeight?.toString() || '', 
            width: service.workDetails?.flatWidth?.toString() || '', 
            gain: service.workDetails?.screenGain?.toString() || '' 
          },
          make: service.workDetails?.screenMake || '',
        },
        
        throwDistance: service.workDetails?.throwDistance?.toString() || '',
        
        imageEvaluation: {
          focusBoresite: mapStatus(service.workDetails?.focusBoresight, service.workDetails?.focusBoresightNote),
          integratorPosition: mapStatus(service.workDetails?.integratorPosition, service.workDetails?.integratorPositionNote),
          spotOnScreen: mapStatus(service.workDetails?.spotsOnScreen, service.workDetails?.spotsOnScreenNote),
          screenCropping: mapStatus(service.workDetails?.screenCroppingOk, service.workDetails?.screenCroppingNote),
          convergence: mapStatus(service.workDetails?.convergenceOk, service.workDetails?.convergenceNote),
          channelsChecked: mapStatus(service.workDetails?.channelsCheckedOk, service.workDetails?.channelsCheckedNote),
          pixelDefects: mapStatus(service.workDetails?.pixelDefects, service.workDetails?.pixelDefectsNote),
          imageVibration: mapStatus(service.workDetails?.imageVibration, service.workDetails?.imageVibrationNote),
          liteLOC: mapStatus(service.workDetails?.liteloc, service.workDetails?.litelocNote),
        },
        
        airPollution: {
          airPollutionLevel: service.workDetails?.airPollutionLevel || '',
          hcho: service.workDetails?.hcho?.toString() || '',
          tvoc: service.workDetails?.tvoc?.toString() || '',
          pm10: service.workDetails?.pm10?.toString() || '',
          pm25: service.workDetails?.pm2_5?.toString() || '',
          pm100: service.workDetails?.pm1?.toString() || '',
          temperature: service.workDetails?.temperature?.toString() || '',
          humidity: service.workDetails?.humidity?.toString() || '',
        },
        
        recommendedParts: service.workDetails?.recommendedParts || [],
        engineerSignatureUrl: service.signatures?.engineer || (service.signatures as any)?.engineerSignatureUrl,
        siteSignatureUrl: service.signatures?.site || (service.signatures as any)?.siteSignatureUrl,
      }


      
      const pdfBytes = await generateMaintenanceReport(reportData)
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Service_Report_${service.serviceNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border border-black mb-4 break-inside-avoid">
      <div className="bg-gray-100 border-b border-black px-3 py-1 font-bold text-sm text-black uppercase">
        {title}
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  )

  const GridRow = ({ items }: { items: { label: string; value: any }[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 mb-2">
      {items.map((item, idx) => (
        item.value ? (
          <div key={idx} className="flex flex-col text-sm">
            <span className="text-gray-500 text-xs uppercase tracking-wider">{item.label}</span>
            <span className="font-medium text-black truncate" title={item.value.toString()}>{item.value.toString()}</span>
          </div>
        ) : null
      ))}
    </div>
  )

  const StatusTable = ({ items }: { items: { label: string; status: string }[] }) => (
    <div className="w-full text-sm">
      <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-1 mb-1 font-semibold text-gray-600">
        <div>Item</div>
        <div>Status</div>
      </div>
      {items.map((item, idx) => (
        item.status ? (
          <div key={idx} className="grid grid-cols-2 gap-2 py-1 border-b border-gray-100 last:border-0">
            <div className="text-gray-700">{item.label}</div>
            <div className="font-medium text-black">{item.status}</div>
          </div>
        ) : null
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-white w-full pb-12">
      {/* Header */}
      <div className="border-b-2 border-black p-4 sticky top-0 bg-white z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={onBack}
              size="sm"
              className="border border-black hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-black flex items-center gap-2">
                Service #{service.serviceNumber}
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {service.date ? new Date(service.date).toLocaleDateString() : "N/A"}
                </span>
              </h1>
              <p className="text-sm text-gray-600 truncate max-w-[300px]">{service.site.name}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {service.workDetails?.photosDriveLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(service.workDetails.photosDriveLink, "_blank")}
                className="flex-1 sm:flex-none border-black text-black hover:bg-gray-50"
              >
                <span className="mr-2">📂</span> Photos
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none bg-black text-white hover:bg-gray-800"
            >
              {isGeneratingPdf ? (
                "Generating..."
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Site & Projector">
            <GridRow items={[
              { label: "Site Name", value: service.site.name },
              { label: "Address", value: service.site.address || service.address },
              { label: "Contact", value: service.site.contactDetails || service.contactDetails },
              { label: "Location", value: service.location },
              { label: "Cinema", value: service.cinemaName },
              { label: "Screen", value: service.site.screenNo || service.screenNumber },
              { label: "Model", value: service.projector.model },
              { label: "Serial", value: service.projector.serialNo },
              { label: "Running Hrs", value: service.projectorRunningHours },
              { label: "Software", value: service.workDetails?.softwareVersion },
            ]} />
          </Section>

          <Section title="Environment & Lamp">
             <GridRow items={[
              { label: "Environment", value: service.workDetails?.projectorPlacementEnvironment },
              { label: "Lamp Make", value: service.workDetails?.lampMakeModel },
              { label: "Lamp Total Hrs", value: service.workDetails?.lampTotalRunningHours },
              { label: "Lamp Curr Hrs", value: service.workDetails?.lampCurrentRunningHours },
              { label: "Content Player", value: service.workDetails?.contentPlayerModel },
              { label: "AC Status", value: service.workDetails?.acStatus },
              { label: "LE Status", value: service.workDetails?.leStatus },
              { label: "LE Serial", value: service.workDetails?.lightEngineSerialNumber },
            ]} />
          </Section>
        </div>

        {/* Technical Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Section title="Opticals">
            <StatusTable items={[
              { label: "Reflector", status: service.workDetails?.reflector },
              { label: "UV Filter", status: service.workDetails?.uvFilter },
              { label: "Integrator Rod", status: service.workDetails?.integratorRod },
              { label: "Cold Mirror", status: service.workDetails?.coldMirror },
              { label: "Fold Mirror", status: service.workDetails?.foldMirror },
            ]} />
          </Section>

          <Section title="Electronics">
            <StatusTable items={[
              { label: "Touch Panel", status: service.workDetails?.touchPanel },
              { label: "EVB Board", status: service.workDetails?.evbBoard },
              { label: "IMCB Board", status: service.workDetails?.ImcbBoard },
              { label: "PIB Board", status: service.workDetails?.pibBoard },
              { label: "ICP Board", status: service.workDetails?.IcpBoard },
              { label: "IMB/S", status: service.workDetails?.imbSBoard },
              { label: "Serial Verified", status: service.workDetails?.serialNumberVerified ? "Yes" : "No" },
            ]} />
          </Section>

          <Section title="Mechanical">
            <StatusTable items={[
              { label: "AC Blower", status: service.workDetails?.acBlowerVane },
              { label: "Extractor", status: service.workDetails?.extractorVane },
              { label: "Exhaust CFM", status: service.workDetails?.exhaustCfm },
              { label: "LE Fans", status: service.workDetails?.lightEngineFans },
              { label: "Card Cage Fans", status: service.workDetails?.cardCageFans },
              { label: "Radiator Fan", status: service.workDetails?.radiatorFanPump },
              { label: "Connector Hose", status: service.workDetails?.pumpConnectorHose },
              { label: "Security Lock", status: service.workDetails?.securityLampHouseLock },
            ]} />
          </Section>

          <Section title="Light Engine & Color">
             <StatusTable items={[
              { label: "White", status: service.workDetails?.lightEngineWhite },
              { label: "Red", status: service.workDetails?.lightEngineRed },
              { label: "Green", status: service.workDetails?.lightEngineGreen },
              { label: "Blue", status: service.workDetails?.lightEngineBlue },
              { label: "Black", status: service.workDetails?.lightEngineBlack },
            ]} />
          </Section>
        </div>

        {/* Coolant Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Section title="Coolant">
            <StatusTable items={[
              { label: "Level and Color", status: service.workDetails?.coolantLevelColor },
            ]} />
          </Section>
        </div>

        {/* Measurements & Calibration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Section title="Screen & Image">
             <GridRow items={[
              { label: "Throw Dist", value: service.workDetails?.throwDistance },
              { label: "Screen Make", value: service.workDetails?.screenMake },
              { label: "Scope H", value: service.workDetails?.screenHeight },
              { label: "Scope W", value: service.workDetails?.screenWidth },
              { label: "Flat H", value: service.workDetails?.flatHeight },
              { label: "Flat W", value: service.workDetails?.flatWidth },
              { label: "Gain", value: service.workDetails?.screenGain },
            ]} />
            <div className="mt-2 pt-2 border-t border-gray-200">
               <StatusTable items={[
                { label: "Focus/Boresight", status: service.workDetails?.focusBoresight ? "Yes" : "No" },
                { label: "Integrator Pos", status: service.workDetails?.integratorPosition ? "Yes" : "No" },
                { label: "Spots", status: service.workDetails?.spotsOnScreen ? "Yes" : "No" },
                { label: "Cropping", status: service.workDetails?.screenCroppingOk ? "Yes" : "No" },
                { label: "Convergence", status: service.workDetails?.convergenceOk ? "Yes" : "No" },
                { label: "Pixel Defects", status: service.workDetails?.pixelDefects },
                { label: "Vibration", status: service.workDetails?.imageVibration },
                { label: "LiteLOC", status: service.workDetails?.liteloc },
              ]} />
            </div>
          </Section>

          <Section title="Color Calibration (MCGD)">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-1">Color</th>
                    <th className="py-1">2K (x, y, fL)</th>
                    <th className="py-1">4K (x, y, fL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="font-semibold py-1">White</td>
                    <td>{service.workDetails?.white2Kx}, {service.workDetails?.white2Ky}, {service.workDetails?.white2Kfl}</td>
                    <td>{service.workDetails?.white4Kx}, {service.workDetails?.white4Ky}, {service.workDetails?.white4Kfl}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1">Red</td>
                    <td>{service.workDetails?.red2Kx}, {service.workDetails?.red2Ky}, {service.workDetails?.red2Kfl}</td>
                    <td>{service.workDetails?.red4Kx}, {service.workDetails?.red4Ky}, {service.workDetails?.red4Kfl}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1">Green</td>
                    <td>{service.workDetails?.green2Kx}, {service.workDetails?.green2Ky}, {service.workDetails?.green2Kfl}</td>
                    <td>{service.workDetails?.green4Kx}, {service.workDetails?.green4Ky}, {service.workDetails?.green4Kfl}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1">Blue</td>
                    <td>{service.workDetails?.blue2Kx}, {service.workDetails?.blue2Ky}, {service.workDetails?.blue2Kfl}</td>
                    <td>{service.workDetails?.blue4Kx}, {service.workDetails?.blue4Ky}, {service.workDetails?.blue4Kfl}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <h4 className="font-bold text-xs mb-1">CIE XYZ</h4>
              <div className="text-xs">
                x: {service.workDetails?.whiteX}, y: {service.workDetails?.whiteY}, fL: {service.workDetails?.whiteFl}
              </div>
            </div>
          </Section>

          <Section title="Air & Voltage">
             <GridRow items={[
              { label: "Pollution Lvl", value: service.workDetails?.airPollutionLevel },
              { label: "Temp", value: service.workDetails?.temperature },
              { label: "Humidity", value: service.workDetails?.humidity },
              { label: "HCHO", value: service.workDetails?.hcho },
              { label: "TVOC", value: service.workDetails?.tvoc },
              { label: "PM2.5", value: service.workDetails?.pm2_5 },
              { label: "PM10", value: service.workDetails?.pm10 },
            ]} />
             <div className="mt-2 pt-2 border-t border-gray-200">
               <h4 className="font-bold text-xs mb-1">Voltage</h4>
               <GridRow items={[
                { label: "P vs N", value: service.workDetails?.pvVsN },
                { label: "P vs E", value: service.workDetails?.pvVsE },
                { label: "N vs E", value: service.workDetails?.nvVsE },
              ]} />
             </div>
          </Section>
        </div>

        {/* Remarks & Parts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {service.remarks && (
            <Section title="Remarks">
              <p className="text-sm text-black whitespace-pre-wrap">{service.remarks}</p>
            </Section>
          )}
          
          {service.workDetails?.recommendedParts && service.workDetails.recommendedParts.length > 0 && (
            <Section title="Recommended Parts">
              <ul className="list-disc list-inside text-sm text-black">
                {service.workDetails.recommendedParts.map((part: any, idx: number) => (
                  <li key={idx}>
                    <span className="font-semibold">{part.partNumber}</span> - {part.description}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* Images */}
        {service.images && service.images.length > 0 && (
          <Section title={`Images (${service.images.length})`}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {service.images.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square border border-gray-200 rounded overflow-hidden bg-gray-50">
                  <Image
                    src={imageUrl}
                    alt={`Service image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                    sizes="150px"
                  />
                </div>
              ))}
            </div>
          </Section>
        )}
        
        {/* Signatures */}
        <div className="flex justify-between items-end border-t border-black pt-4 mt-8">
           <div className="text-center">
              {service.signatures?.site || (service.signatures as any)?.siteSignatureUrl ? (
                <div className="relative w-32 h-16 mb-2 mx-auto">
                   <Image 
                     src={service.signatures?.site || (service.signatures as any)?.siteSignatureUrl} 
                     alt="Site Signature" 
                     fill 
                     className="object-contain" 
                   />
                </div>
              ) : <div className="h-16 w-32 mb-2 bg-gray-50 border border-dashed border-gray-300"></div>}
              <p className="text-xs font-bold uppercase">Client Signature</p>
           </div>
           
           <div className="text-center">
              {service.signatures?.engineer || (service.signatures as any)?.engineerSignatureUrl ? (
                <div className="relative w-32 h-16 mb-2 mx-auto">
                   <Image 
                     src={service.signatures?.engineer || (service.signatures as any)?.engineerSignatureUrl} 
                     alt="Engineer Signature" 
                     fill 
                     className="object-contain" 
                   />
                </div>
              ) : <div className="h-16 w-32 mb-2 bg-gray-50 border border-dashed border-gray-300"></div>}
              <p className="text-xs font-bold uppercase">Engineer Signature</p>
           </div>
        </div>
      </div>
    </div>
  )
}

