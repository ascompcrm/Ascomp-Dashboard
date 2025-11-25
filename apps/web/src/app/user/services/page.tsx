"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, ChevronRight } from "lucide-react"

interface Service {
  id: string
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
  completedAt: string
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

export default function ServicesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
        return
      }
      fetchServices()
    }
  }, [user, isLoading, router])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/user/services/completed", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
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

  const downloadPDF = (reportUrl: string) => {
    if (reportUrl) {
      window.open(reportUrl, "_blank")
    }
  }

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
        onDownloadPDF={downloadPDF}
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
          <h1 className="text-3xl font-bold text-black">Completed Services</h1>
          <p className="text-gray-600 mt-2">{services.length} service{services.length !== 1 ? "s" : ""} completed</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full">
        {services.length === 0 ? (
          <Card className="border-2 border-black">
            <CardContent className="p-12 text-center">
              <p className="text-lg text-gray-600">No completed services yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
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
                          Service #{service.serviceNumber}
                        </h3>
                        {service.reportGenerated && (
                          <span className="text-xs bg-black text-white px-2 py-1 uppercase">
                            Report Generated
                          </span>
                        )}
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
                          <p className="font-semibold text-black">{formatDateTime(service.completedAt)}</p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 flex-shrink-0" />
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
  onDownloadPDF,
}: {
  service: Service
  onBack: () => void
  onDownloadPDF: (url: string) => void
}) {
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

  const renderField = (label: string, value: any, type: "text" | "number" | "boolean" | "date" = "text") => {
    if (value === null || value === undefined || value === "") return null

    let displayValue: string
    if (type === "boolean") {
      displayValue = value ? "Yes" : "No"
    } else if (type === "date") {
      displayValue = formatDateTime(value)
    } else if (type === "number") {
      displayValue = typeof value === "number" ? value.toString() : value
    } else {
      displayValue = String(value)
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-gray-200">
        <p className="text-sm text-gray-600 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-black sm:col-span-2">{displayValue}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="border-b-2 border-black p-4 sm:p-6 sticky top-0 bg-white z-10">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 border-2 border-black hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Service #{service.serviceNumber}</h1>
              <p className="text-gray-600 mt-1">{service.site.name}</p>
            </div>
            {service.reportGenerated && service.reportUrl && (
              <Button
                onClick={() => onDownloadPDF(service.reportUrl!)}
                className="border-2 border-black hover:bg-gray-100"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Site Information */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderField("Site Name", service.site.name)}
            {renderField("Address", service.site.address || service.address)}
            {renderField("Screen Number", service.site.screenNo || service.screenNumber)}
            {renderField("Contact Details", service.site.contactDetails || service.contactDetails)}
            {renderField("Location", service.location)}
            {renderField("Cinema Name", service.cinemaName)}
            {renderField("Service Date", service.date, "date")}
            {renderField("Completed At", service.completedAt, "date")}
          </CardContent>
        </Card>

        {/* Projector Information */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Projector Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderField("Model", service.projector.model)}
            {renderField("Serial Number", service.projector.serialNo)}
            {renderField("Running Hours", service.projector.runningHours, "number")}
            {renderField("Projector Running Hours", service.projectorRunningHours, "number")}
            {renderField("Light Engine Serial Number", service.workDetails?.lightEngineSerialNumber)}
            {renderField("Software Version", service.workDetails?.softwareVersion)}
          </CardContent>
        </Card>

        {/* Screen Details */}
        {(service.workDetails?.screenHeight ||
          service.workDetails?.screenWidth ||
          service.workDetails?.screenGain ||
          service.workDetails?.screenMake ||
          service.workDetails?.throwDistance) && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black">Screen Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField("Height", service.workDetails?.screenHeight, "number")}
              {renderField("Width", service.workDetails?.screenWidth, "number")}
              {renderField("Gain", service.workDetails?.screenGain, "number")}
              {renderField("Make", service.workDetails?.screenMake)}
              {renderField("Throw Distance", service.workDetails?.throwDistance, "number")}
            </CardContent>
          </Card>
        )}

        {/* Lamp Information */}
        {(service.workDetails?.lampMakeModel ||
          service.workDetails?.lampTotalRunningHours ||
          service.workDetails?.lampCurrentRunningHours) && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black">Lamp Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField("Make/Model", service.workDetails?.lampMakeModel)}
              {renderField("Total Running Hours", service.workDetails?.lampTotalRunningHours, "number")}
              {renderField("Current Running Hours", service.workDetails?.lampCurrentRunningHours, "number")}
            </CardContent>
          </Card>
        )}

        {/* Color Calibration */}
        {(service.workDetails?.whiteX ||
          service.workDetails?.whiteY ||
          service.workDetails?.redX ||
          service.workDetails?.greenX ||
          service.workDetails?.blueX) && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black">Color Calibration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField("White X", service.workDetails?.whiteX, "number")}
              {renderField("White Y", service.workDetails?.whiteY, "number")}
              {renderField("White FL", service.workDetails?.whiteFl, "number")}
              {renderField("Red X", service.workDetails?.redX, "number")}
              {renderField("Red Y", service.workDetails?.redY, "number")}
              {renderField("Red FL", service.workDetails?.redFl, "number")}
              {renderField("Green X", service.workDetails?.greenX, "number")}
              {renderField("Green Y", service.workDetails?.greenY, "number")}
              {renderField("Green FL", service.workDetails?.greenFl, "number")}
              {renderField("Blue X", service.workDetails?.blueX, "number")}
              {renderField("Blue Y", service.workDetails?.blueY, "number")}
              {renderField("Blue FL", service.workDetails?.blueFl, "number")}
            </CardContent>
          </Card>
        )}

        {/* Focus & Alignment */}
        {(service.workDetails?.flCenter ||
          service.workDetails?.flLeft ||
          service.workDetails?.flRight ||
          service.workDetails?.focusBoresight !== undefined ||
          service.workDetails?.pvVsN ||
          service.workDetails?.pvVsE ||
          service.workDetails?.nvVsE) && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black">Focus & Alignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField("FL Center", service.workDetails?.flCenter, "number")}
              {renderField("FL Left", service.workDetails?.flLeft, "number")}
              {renderField("FL Right", service.workDetails?.flRight, "number")}
              {renderField("PV vs N", service.workDetails?.pvVsN)}
              {renderField("PV vs E", service.workDetails?.pvVsE)}
              {renderField("NV vs E", service.workDetails?.nvVsE)}
              {renderField("Focus Boresight", service.workDetails?.focusBoresight, "boolean")}
              {renderField("Integrator Position", service.workDetails?.integratorPosition, "boolean")}
              {renderField("Spots on Screen", service.workDetails?.spotsOnScreen, "boolean")}
              {renderField("Screen Cropping OK", service.workDetails?.screenCroppingOk, "boolean")}
              {renderField("Convergence OK", service.workDetails?.convergenceOk, "boolean")}
              {renderField("Channels Checked OK", service.workDetails?.channelsCheckedOk, "boolean")}
            </CardContent>
          </Card>
        )}

        {/* Environmental Data */}
        {(service.workDetails?.hcho ||
          service.workDetails?.tvoc ||
          service.workDetails?.temperature ||
          service.workDetails?.humidity) && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black">Environmental Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField("HCHO", service.workDetails?.hcho, "number")}
              {renderField("TVOC", service.workDetails?.tvoc, "number")}
              {renderField("PM1", service.workDetails?.pm1, "number")}
              {renderField("PM2.5", service.workDetails?.pm2_5, "number")}
              {renderField("PM10", service.workDetails?.pm10, "number")}
              {renderField("Temperature", service.workDetails?.temperature, "number")}
              {renderField("Humidity", service.workDetails?.humidity, "number")}
            </CardContent>
          </Card>
        )}

        {/* Component Status */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Component Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderField("Reflector", service.workDetails?.reflector)}
            {renderField("UV Filter", service.workDetails?.uvFilter)}
            {renderField("Integrator Rod", service.workDetails?.integratorRod)}
            {renderField("Cold Mirror", service.workDetails?.coldMirror)}
            {renderField("Fold Mirror", service.workDetails?.foldMirror)}
            {renderField("Touch Panel", service.workDetails?.touchPanel)}
            {renderField("EVB/IMCB Board", service.workDetails?.evbImcbBoard)}
            {renderField("PIB/ICP Board", service.workDetails?.pibIcpBoard)}
            {renderField("IMB/S Board", service.workDetails?.imbSBoard)}
            {renderField("Disposable Consumables", service.workDetails?.disposableConsumables)}
            {renderField("Coolant Level Color", service.workDetails?.coolantLevelColor)}
            {renderField("Light Engine White", service.workDetails?.lightEngineWhite)}
            {renderField("Light Engine Red", service.workDetails?.lightEngineRed)}
            {renderField("Light Engine Green", service.workDetails?.lightEngineGreen)}
            {renderField("Light Engine Blue", service.workDetails?.lightEngineBlue)}
            {renderField("Light Engine Black", service.workDetails?.lightEngineBlack)}
            {renderField("AC Blower Vane", service.workDetails?.acBlowerVane)}
            {renderField("Extractor Vane", service.workDetails?.extractorVane)}
            {renderField("Exhaust CFM", service.workDetails?.exhaustCfm)}
            {renderField("Light Engine Fans", service.workDetails?.lightEngineFans)}
            {renderField("Card Cage Fans", service.workDetails?.cardCageFans)}
            {renderField("Radiator Fan Pump", service.workDetails?.radiatorFanPump)}
            {renderField("Pump Connector Hose", service.workDetails?.pumpConnectorHose)}
            {renderField("Security Lamp House Lock", service.workDetails?.securityLampHouseLock)}
            {renderField("Lamp Loc Mechanism", service.workDetails?.lampLocMechanism)}
            {renderField("Projector Placement Environment", service.workDetails?.projectorPlacementEnvironment)}
            {renderField("AC Status", service.workDetails?.acStatus)}
            {renderField("LE Status", service.workDetails?.leStatus)}
            {renderField("Content Player Model", service.workDetails?.contentPlayerModel)}
            {renderField("Pixel Defects", service.workDetails?.pixelDefects)}
            {renderField("Image Vibration", service.workDetails?.imageVibration)}
            {renderField("Liteloc", service.workDetails?.liteloc)}
            {renderField("Serial Number Verified", service.workDetails?.serialNumberVerified, "boolean")}
            {renderField("Replacement Required", service.workDetails?.replacementRequired, "boolean")}
          </CardContent>
        </Card>

        {/* Time Information */}
        {(service.workDetails?.startTime || service.workDetails?.endTime) && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black">Time Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {renderField("Start Time", service.workDetails?.startTime, "date")}
              {renderField("End Time", service.workDetails?.endTime, "date")}
            </CardContent>
          </Card>
        )}

        {/* Remarks */}
        {service.remarks && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black">Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black whitespace-pre-wrap">{service.remarks}</p>
            </CardContent>
          </Card>
        )}

        {/* Images */}
        {service.images && service.images.length > 0 && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black">Images ({service.images.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {service.images.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-square border-2 border-black rounded overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={`Service image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Broken Images */}
        {service.brokenImages && service.brokenImages.length > 0 && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black">Broken/Damaged Images ({service.brokenImages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {service.brokenImages.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-square border-2 border-red-600 rounded overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={`Broken image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signatures */}
        {service.signatures && (service.signatures.engineer || service.signatures.site || (typeof service.signatures === 'object' && Object.keys(service.signatures).length > 0)) && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black">Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(service.signatures.engineer || (service.signatures as any).engineerSignatureUrl) && (
                  <div>
                    <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Engineer Signature</p>
                    <div className="relative w-full aspect-[2/1] border-2 border-black rounded overflow-hidden bg-white">
                      <Image
                        src={service.signatures.engineer || (service.signatures as any).engineerSignatureUrl}
                        alt="Engineer signature"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                )}
                {(service.signatures.site || (service.signatures as any).siteSignatureUrl) && (
                  <div>
                    <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Site In-Charge Signature</p>
                    <div className="relative w-full aspect-[2/1] border-2 border-black rounded overflow-hidden bg-white">
                      <Image
                        src={service.signatures.site || (service.signatures as any).siteSignatureUrl}
                        alt="Site in-charge signature"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

