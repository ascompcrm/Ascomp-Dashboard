import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import jsPDF from 'jspdf'

export default function GenerateReportStep({ data, onNext, onBack }: any) {
  const [reportGenerated, setReportGenerated] = useState(false)

  const generatePDF = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 10

    // Header
    pdf.setFontSize(16)
    pdf.text('EW - Preventive Maintenance Report', pageWidth / 2, yPosition, {
      align: 'center',
    })
    yPosition += 8

    pdf.setFontSize(9)
    pdf.text('ASCOMP INC', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 5
    pdf.text('Address: 9, Community Centre, 2nd Floor, Phase I, Mayapuri, New Delhi', pageWidth / 2, yPosition, {
      align: 'center',
    })
    yPosition += 5
    pdf.text('Phone: 011-45501226 | Mobile: 8882475207 | Email: helpdesk@ascompinc.in', pageWidth / 2, yPosition, {
      align: 'center',
    })
    yPosition += 10

    // Service Details
    const service = data.selectedService
    pdf.setFontSize(11)
    pdf.text('SERVICE DETAILS', 10, yPosition)
    yPosition += 6

    pdf.setFontSize(9)
    const details = [
      `Site: ${service.site}`,
      `Projector: ${service.projector}`,
      `Type: ${service.type}`,
      `Date: ${service.date}`,
    ]

    details.forEach((detail) => {
      pdf.text(detail, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Projector Information
    const workDetails = data.workDetails
    pdf.text('PROJECTOR INFORMATION', 10, yPosition)
    yPosition += 6

    const projectorInfo = [
      `Model: ${workDetails.projectorModel}`,
      `Serial No.: ${workDetails.projectorSerialNumber}`,
      `Running Hours: ${workDetails.projectorRunningHours}`,
      `Replacement Required: ${workDetails.replacementRequired ? 'Yes' : 'No'}`,
    ]

    projectorInfo.forEach((info) => {
      pdf.text(info, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Cinema Details
    if (yPosition > pageHeight - 50) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('CINEMA DETAILS', 10, yPosition)
    yPosition += 6

    const cinemaInfo = [
      `Cinema Name: ${workDetails.cinemaName}`,
      `Address: ${workDetails.address}`,
      `Location: ${workDetails.location}`,
      `Screen No: ${workDetails.screenNumber}`,
      `Contact: ${workDetails.contactDetails}`,
      `Service Type: ${workDetails.serviceVisitType}`,
    ]

    cinemaInfo.forEach((info) => {
      pdf.text(info, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Opticals Status
    if (yPosition > pageHeight - 50) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('COMPONENTS STATUS', 10, yPosition)
    yPosition += 6

    const componentsStatus = [
      `Reflector: ${workDetails.reflector}`,
      `UV Filter: ${workDetails.uvFilter}`,
      `Integrator Rod: ${workDetails.integratorRod}`,
      `Cold Mirror: ${workDetails.coldMirror}`,
      `Fold Mirror: ${workDetails.foldMirror}`,
      `Touch Panel: ${workDetails.touchPanel}`,
      `Coolant Level: ${workDetails.coolantLevelColor}`,
    ]

    componentsStatus.forEach((component) => {
      if (yPosition > pageHeight - 10) {
        pdf.addPage()
        yPosition = 10
      }
      pdf.text(component, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Light Engine Tests
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('LIGHT ENGINE TEST RESULTS', 10, yPosition)
    yPosition += 6

    const lightEngineTests = [
      `White: ${workDetails.lightEngineWhite}`,
      `Red: ${workDetails.lightEngineRed}`,
      `Green: ${workDetails.lightEngineGreen}`,
      `Blue: ${workDetails.lightEngineBlue}`,
      `Black: ${workDetails.lightEngineBlack}`,
    ]

    lightEngineTests.forEach((test) => {
      pdf.text(test, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Additional Details
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('ADDITIONAL DETAILS', 10, yPosition)
    yPosition += 6

    const additionalInfo = [
      `Software Version: ${workDetails.softwareVersion}`,
      `Lamp Make/Model: ${workDetails.lampMakeModel}`,
      `Screen Make: ${workDetails.screenMake}`,
      `AC Status: ${workDetails.acStatus}`,
    ]

    additionalInfo.forEach((info) => {
      pdf.text(info, 15, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Remarks
    if (yPosition > pageHeight - 30) {
      pdf.addPage()
      yPosition = 10
    }
    pdf.text('REMARKS', 10, yPosition)
    yPosition += 6
    const remarksText = pdf.splitTextToSize(workDetails.remarks || 'None', pageWidth - 20)
    remarksText.forEach((line: string) => {
      if (yPosition > pageHeight - 10) {
        pdf.addPage()
        yPosition = 10
      }
      pdf.text(line, 15, yPosition)
      yPosition += 5
    })

    // Footer
    if (yPosition > pageHeight - 20) {
      pdf.addPage()
      yPosition = pageHeight - 25
    }

    pdf.setFontSize(10)
    pdf.text('SERVICE REPORT GENERATED', 10, yPosition)
    pdf.text(`Date: ${new Date().toLocaleString()}`, 10, yPosition + 5)

    pdf.save(`Service_Report_${service.projector}_${new Date().getTime()}.pdf`)
    setReportGenerated(true)
  }

  const handleNext = () => {
    onNext({ reportGenerated: true })
  }

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Generate Report</h2>
      <p className="text-sm text-gray-700 mb-4">Fill the values and generate a PDF report</p>

      <Card className="border-2 border-black p-3 sm:p-4 mb-4">
        <h3 className="font-bold text-black mb-3 text-sm sm:text-base">Report Summary</h3>
        <div className="space-y-2 text-xs sm:text-sm mb-4">
          <div>
            <span className="font-semibold">Site:</span> <span className="break-words">{data.selectedService?.site}</span>
          </div>
          <div>
            <span className="font-semibold">Projector:</span> {data.workDetails?.projectorModel}
          </div>
          <div>
            <span className="font-semibold">Serial No:</span> {data.workDetails?.projectorSerialNumber}
          </div>
          <div>
            <span className="font-semibold">Running Hours:</span> {data.workDetails?.projectorRunningHours}
          </div>
          <div>
            <span className="font-semibold">Cinema:</span> {data.workDetails?.cinemaName}
          </div>
        </div>

        {!reportGenerated ? (
          <Button
            onClick={generatePDF}
            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold py-2 text-sm"
          >
            Generate PDF Report
          </Button>
        ) : (
          <div className="p-3 bg-black text-white border-2 border-black text-center font-bold text-sm">
            ✓ Report Generated Successfully
          </div>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-2 border-black text-black hover:bg-gray-100 flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!reportGenerated}
          className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold disabled:opacity-50 flex-1"
        >
          Continue to Complete
        </Button>
      </div>
    </div>
  )
}
