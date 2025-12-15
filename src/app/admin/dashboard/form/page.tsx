"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save, RefreshCw } from "lucide-react"
import { toast } from "sonner"

type FieldType = "text" | "number" | "date" | "textarea" | "select" | "checkbox"

type FieldConfig = {
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: string[]
  section?: string
  defaultValue?: string
  min?: number
  max?: number
  componentType?: "statusSelectWithNote"
  noteOptions?: string[]
  noteDefault?: string
  issueValues?: string[]
  optionDescriptions?: Record<string, string>
}

type ProjectorPart = {
  projector_model: string
  part_number: string
  description: string
}

const FORM_SECTIONS = [
  "Cinema Details",
  "Projector Information",
  "Opticals",
  "Electronics",
  "Serial Number Verified",
  "Disposable Consumables",
  "Coolant",
  "Light Engine Test Pattern",
  "Mechanical",
  "Software & Screen Information",
  "Lamp Information",
  "Voltage Parameters",
  "fL Measurements",
  "Content Player & AC Status",
  "Color Accuracy - MCGD",
  "Color Accuracy - CIE XYZ",
  "Image Evaluation",
  "Air Pollution Data",
  "Recommended Parts",
  "Remarks",
  "Service Images",
]

const getInitialFieldConfigs = (): FieldConfig[] => {
  return [
    // Cinema Details
    { key: "cinemaName", label: "Cinema Name", type: "text", required: true, section: "Cinema Details" },
    { key: "date", label: "Date", type: "date", required: true, section: "Cinema Details" },
    { key: "address", label: "Address", type: "textarea", required: true, section: "Cinema Details" },
    { key: "contactDetails", label: "Contact Details", type: "text", section: "Cinema Details" },
    { key: "screenNumber", label: "Screen No", type: "number", section: "Cinema Details" },
    {
      key: "serviceVisitType",
      label: "Service Visit Type",
      type: "select",
      section: "Cinema Details",
      options: ["1", "2", "3", "4", "5", "6", "special"],
    },
    // Projector Information
    { key: "projectorModel", label: "Projector Model", type: "text", required: true, section: "Projector Information" },
    { key: "projectorSerialNumber", label: "Serial Number", type: "text", required: true, section: "Projector Information" },
    { key: "projectorRunningHours", label: "Running Hours", type: "number", required: true, section: "Projector Information" },
    // Opticals
    { key: "reflector", label: "Reflector", type: "select", section: "Opticals", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "uvFilter", label: "UV Filter", type: "select", section: "Opticals", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "integratorRod", label: "Integrator Rod", type: "select", section: "Opticals", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "coldMirror", label: "Cold Mirror", type: "select", section: "Opticals", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "foldMirror", label: "Fold Mirror", type: "select", section: "Opticals", options: ["OK", "YES"], defaultValue: "OK" },
    // Electronics
    { key: "touchPanel", label: "Touch Panel", type: "select", section: "Electronics", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "evbBoard", label: "EVB Board", type: "select", section: "Electronics", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "ImcbBoard", label: "IMCB Board", type: "select", section: "Electronics", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "pibBoard", label: "PIB Board", type: "select", section: "Electronics", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "IcpBoard", label: "ICP Board", type: "select", section: "Electronics", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "imbSBoard", label: "IMB/S Board", type: "select", section: "Electronics", options: ["OK", "YES"], defaultValue: "OK" },
    // Mechanical
    { key: "acBlowerVane", label: "AC Blower Vane", type: "select", section: "Mechanical", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "extractorVane", label: "Extractor Vane", type: "select", section: "Mechanical", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "lightEngineFans", label: "Light Engine Fans", type: "select", section: "Mechanical", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "cardCageFans", label: "Card Cage Fans", type: "select", section: "Mechanical", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "radiatorFanPump", label: "Radiator Fan Pump", type: "select", section: "Mechanical", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "pumpConnectorHose", label: "Pump Connector & Hose", type: "select", section: "Mechanical", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "securityLampHouseLock", label: "Security & Lamp Lock", type: "select", section: "Mechanical", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "lampLocMechanism", label: "Lamp LOC Mechanism", type: "select", section: "Mechanical", options: ["OK", "YES"], defaultValue: "OK" },
    { key: "exhaustCfm", label: "Exhaust CFM (M/s)", type: "number", section: "Mechanical" },
    { key: "projectorPlacementEnvironment", label: "Projector Placement & Environment", type: "textarea", section: "Mechanical" },
    // Software & Screen Information
    { key: "softwareVersion", label: "Software Version", type: "select", section: "Software & Screen Information" },
    { key: "screenHeight", label: "Screen Height (m)", type: "number", section: "Software & Screen Information" },
    { key: "screenWidth", label: "Screen Width (m)", type: "number", section: "Software & Screen Information" },
    { key: "flatHeight", label: "Flat Height (m)", type: "number", section: "Software & Screen Information" },
    { key: "flatWidth", label: "Flat Width (m)", type: "number", section: "Software & Screen Information" },
    { key: "screenGain", label: "Screen Gain", type: "number", section: "Software & Screen Information" },
    { key: "screenMake", label: "Screen Make", type: "text", section: "Software & Screen Information" },
    { key: "throwDistance", label: "Throw Distance (m)", type: "number", section: "Software & Screen Information" },
    // Lamp Information
    { key: "lampMakeModel", label: "Lamp Make & Model", type: "select", section: "Lamp Information" },
    { key: "lampTotalRunningHours", label: "Total Running Hours", type: "number", section: "Lamp Information" },
    { key: "lampCurrentRunningHours", label: "Current Running Hours", type: "number", section: "Lamp Information" },
    // Voltage Parameters
    { key: "pvVsN", label: "P vs N", type: "number", section: "Voltage Parameters" },
    { key: "pvVsE", label: "P vs E", type: "number", section: "Voltage Parameters" },
    { key: "nvVsE", label: "N vs E", type: "number", section: "Voltage Parameters" },
    // fL Measurements
    { key: "flLeft", label: "Before", type: "number", section: "fL Measurements" },
    { key: "flRight", label: "After", type: "number", section: "fL Measurements" },
    // Content Player & AC Status
    { key: "contentPlayerModel", label: "Content Player Model", type: "select", section: "Content Player & AC Status" },
    { key: "acStatus", label: "AC Status", type: "select", section: "Content Player & AC Status", options: ["Working", "Not Working", "Not Available"] },
    { key: "leStatus", label: "LE Status", type: "select", section: "Content Player & AC Status", options: ["Removed", "Not removed – Good fL", "Not removed – De-bonded"] },
    // Image Evaluation
    { key: "focusBoresight", label: "Focus/Boresight OK", type: "select", section: "Image Evaluation", options: ["OK", "YES"] },
    { key: "integratorPosition", label: "Integrator Position OK", type: "select", section: "Image Evaluation", options: ["OK", "YES"] },
    { key: "spotsOnScreen", label: "Spots on Screen OK", type: "select", section: "Image Evaluation", options: ["OK", "YES"] },
    { key: "screenCroppingOk", label: "Screen Cropping OK", type: "select", section: "Image Evaluation", options: ["OK", "YES"] },
    { key: "convergenceOk", label: "Convergence OK", type: "select", section: "Image Evaluation", options: ["OK", "YES"] },
    { key: "channelsCheckedOk", label: "Channels Checked OK", type: "select", section: "Image Evaluation", options: ["OK", "YES"] },
    { key: "pixelDefects", label: "Pixel Defects", type: "select", section: "Image Evaluation", options: ["OK", "YES"] },
    { key: "imageVibration", label: "Image Vibration", type: "select", section: "Image Evaluation", options: ["OK", "YES"] },
    { key: "liteloc", label: "LiteLOC Status", type: "select", section: "Image Evaluation", options: ["OK", "YES"] },
    // Air Pollution Data
    { key: "hcho", label: "HCHO", type: "number", section: "Air Pollution Data" },
    { key: "tvoc", label: "TVOC", type: "number", section: "Air Pollution Data" },
    { key: "pm1", label: "PM1", type: "number", section: "Air Pollution Data" },
    { key: "pm2_5", label: "PM2.5", type: "number", section: "Air Pollution Data" },
    { key: "pm10", label: "PM10", type: "number", section: "Air Pollution Data" },
    { key: "temperature", label: "Temperature (°C)", type: "number", section: "Air Pollution Data" },
    { key: "humidity", label: "Humidity (%)", type: "number", section: "Air Pollution Data" },
    { key: "airPollutionLevel", label: "Air Pollution Level", type: "text", section: "Air Pollution Data" },
    // Remarks
    { key: "remarks", label: "Remarks", type: "textarea", section: "Remarks" },
    { key: "lightEngineSerialNumber", label: "Light Engine Serial Number", type: "text", section: "Remarks" },
  ]
}

export default function FormBuilderPage() {
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>(getInitialFieldConfigs())
  const [newOption, setNewOption] = useState<Record<string, string>>({})
  
  // Data file management
  const [contentPlayers, setContentPlayers] = useState<string[]>([])
  const [lampModelsData, setLampModelsData] = useState<Array<{ projector_model: string; Models: string[] }>>([])
  const [softwareVersions, setSoftwareVersions] = useState<string[]>([])
  const [projectorPartsData, setProjectorPartsData] = useState<ProjectorPart[]>([])
  
  const [newDataValue, setNewDataValue] = useState<Record<string, string>>({})
  const [newLampModelValue, setNewLampModelValue] = useState<Record<string, string>>({})
  const [newProjectorModel, setNewProjectorModel] = useState("")
  
  const [selectedProjectorIndex, setSelectedProjectorIndex] = useState<number | null>(null)
  
  // Projector Parts State
  const [selectedPartsProjector, setSelectedPartsProjector] = useState<string | null>(null)
  const [newPartValue, setNewPartValue] = useState<{ part_number: string; description: string }>({ part_number: "", description: "" })
  const [newPartsProjectorModel, setNewPartsProjectorModel] = useState("")

  const [loadingDataFiles, setLoadingDataFiles] = useState(true)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/admin/form-config", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          if (data.config && Array.isArray(data.config) && data.config.length > 0) {
            setFieldConfigs(data.config)
          }
        }
      } catch (error) {
        console.error("Failed to load form config:", error)
      }
    }
    loadConfig()
  }, [])

  // Load data files
  useEffect(() => {
    const loadDataFiles = async () => {
      setLoadingDataFiles(true)
      try {
        const results = await Promise.all([
          fetch("/api/admin/data-files/content-player?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
          fetch("/api/admin/data-files/lamp-models?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
          fetch("/api/admin/data-files/software?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
          fetch("/api/admin/data-files/projector?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
        ])
        const [contentRes, lampRes, softwareRes, projectorRes] = results

        if (contentRes.ok) {
          const data = await contentRes.json()
          setContentPlayers(data.values || [])
        } else {
          const errorText = await contentRes.text()
          console.error("Failed to load content players:", contentRes.status, errorText)
        }
        
        if (lampRes.ok) {
          const data = await lampRes.json()
          setLampModelsData(data.data || [])
        } else {
          const errorText = await lampRes.text()
          console.error("Failed to load lamp models:", lampRes.status, errorText)
        }
        
        if (softwareRes.ok) {
          const data = await softwareRes.json()
          setSoftwareVersions(data.values || [])
        } else {
          const errorText = await softwareRes.text()
          console.error("Failed to load software versions:", softwareRes.status, errorText)
        }

        if (projectorRes.ok) {
          const data = await projectorRes.json()
          // Ensure data is ProjectorPart[]
          setProjectorPartsData(data.data || [])
        } else {
           const errorText = await projectorRes.text()
           console.error("Failed to load projector parts:", projectorRes.status, errorText)
        }
      } catch (error) {
        console.error("Failed to load data files:", error)
      } finally {
        setLoadingDataFiles(false)
      }
    }
    loadDataFiles()
  }, [])

  // Derived unique projector models for parts
  const uniquePartsModels = Array.from(new Set(projectorPartsData.map(p => p.projector_model))).filter(Boolean).sort()
  
  // Set default selected parts projector if available
  useEffect(() => {
    if (uniquePartsModels.length > 0 && selectedPartsProjector === null) {
      setSelectedPartsProjector(uniquePartsModels[0] as string)
    }
  }, [uniquePartsModels, selectedPartsProjector])

  // Set default selected projector and reset if invalid
  useEffect(() => {
    if (lampModelsData.length > 0) {
      // If no projector is selected, select the first one
      if (selectedProjectorIndex === null) {
        setSelectedProjectorIndex(0)
      }
      // If selected index is invalid, reset to first one
      else if (selectedProjectorIndex < 0 || selectedProjectorIndex >= lampModelsData.length) {
        setSelectedProjectorIndex(0)
      }
    } else {
      // No projectors available, reset selection
      setSelectedProjectorIndex(null)
    }
  }, [lampModelsData, selectedProjectorIndex])

  const saveConfig = async () => {
    try {
      const payload = { config: fieldConfigs }
      
      const res = await fetch("/api/admin/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      
      if (res.ok) {
        const result = await res.json()
        toast.success(`Form configuration saved! ${result.savedFields || fieldConfigs.length} fields.`)
      } else {
        const errorText = await res.text()
        console.error("Failed to save config - Response:", errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        toast.error(`Failed to save: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to save form config - Exception:", error)
      toast.error(`Failed to save: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const updateField = (key: string, updates: Partial<FieldConfig>) => {
    setFieldConfigs((prev) =>
      prev.map((field) => (field.key === key ? { ...field, ...updates } : field))
    )
  }

  const addOption = (fieldKey: string) => {
    const option = newOption[fieldKey]?.trim()
    if (!option) return

    updateField(fieldKey, {
      options: [...(fieldConfigs.find((f) => f.key === fieldKey)?.options || []), option],
    })
    setNewOption((prev) => ({ ...prev, [fieldKey]: "" }))
  }

  const removeOption = (fieldKey: string, optionIndex: number) => {
    const field = fieldConfigs.find((f) => f.key === fieldKey)
    if (!field?.options) return

    updateField(fieldKey, {
      options: field.options.filter((_, i) => i !== optionIndex),
    })
  }

  // Data file management functions
  const saveDataFile = async (fileType: "content-player" | "lamp-models" | "software" | "projector", values: any, silent = false) => {
    try {
      let bodyData: any = {}
      if (fileType === "lamp-models") {
        bodyData = { data: values }
      } else if (fileType === "projector") {
        bodyData = { data: values }
      } else {
        bodyData = { values }
      }

      const res = await fetch(`/api/admin/data-files/${fileType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyData),
      })

      if (res.ok) {
        const result = await res.json()
        if (!silent) {
          toast.success(`Saved ${result.saved} ${fileType.replace('-', ' ')} items`)
        }
        
        // Update local state
        if (fileType === "content-player") setContentPlayers(values as string[])
        if (fileType === "lamp-models") setLampModelsData(values as Array<{ projector_model: string; Models: string[] }>)
        if (fileType === "software") setSoftwareVersions(values as string[])
        if (fileType === "projector") setProjectorPartsData(values as ProjectorPart[])
      } else {
        const errorText = await res.text()
        console.error(`Failed to save ${fileType} - Response:`, errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        toast.error(`Failed to save ${fileType}: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error(`Failed to save ${fileType}:`, error)
      toast.error(`Failed to save ${fileType}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const addDataValue = (fileType: "content-player" | "lamp-models" | "software") => {
    const value = newDataValue[fileType]?.trim()
    if (!value) return

    if (fileType === "content-player") {
      const updated = [...contentPlayers, value]
      saveDataFile(fileType, updated)
    } else if (fileType === "software") {
      const updated = [...softwareVersions, value]
      saveDataFile(fileType, updated)
    }
    
    setNewDataValue((prev) => ({ ...prev, [fileType]: "" }))
  }

  const removeDataValue = (fileType: "content-player" | "lamp-models" | "software", index: number) => {
    if (fileType === "content-player") {
      const updated = contentPlayers.filter((_, i) => i !== index)
      saveDataFile(fileType, updated)
    } else if (fileType === "software") {
      const updated = softwareVersions.filter((_, i) => i !== index)
      saveDataFile(fileType, updated)
    }
  }

  const updateDataValue = (fileType: "content-player" | "lamp-models" | "software", index: number, newValue: string) => {
    // Update local state immediately for UI responsiveness
    if (fileType === "content-player") {
      const updated = [...contentPlayers]
      updated[index] = newValue
      setContentPlayers(updated)
    } else if (fileType === "software") {
      const updated = [...softwareVersions]
      updated[index] = newValue
      setSoftwareVersions(updated)
    }
  }

  const saveDataValueOnBlur = (fileType: "content-player" | "lamp-models" | "software") => {
    if (fileType === "content-player") {
      saveDataFile(fileType, contentPlayers, true) // silent
    } else if (fileType === "software") {
      saveDataFile(fileType, softwareVersions, true) // silent
    }
  }

  // Projector Parts Management
  const addProjectorPart = () => {
    if (!selectedPartsProjector || !newPartValue.part_number || !newPartValue.description) return
    const newPart: ProjectorPart = {
      projector_model: selectedPartsProjector,
      part_number: newPartValue.part_number.trim(),
      description: newPartValue.description.trim()
    }
    const updated = [...projectorPartsData, newPart]
    saveDataFile("projector", updated) // Autosave
    setNewPartValue({ part_number: "", description: "" })
  }

  const removeProjectorPart = (partToRemove: ProjectorPart) => {
    const updated = projectorPartsData.filter(p => 
      !(p.projector_model === partToRemove.projector_model && 
        p.part_number === partToRemove.part_number &&
        p.description === partToRemove.description)
    )
    saveDataFile("projector", updated)
  }

  const updateProjectorPart = (originalPart: ProjectorPart, field: keyof ProjectorPart, value: string) => {
    const updated = projectorPartsData.map(p => {
       if (p === originalPart) {
         return { ...p, [field]: value }
       }
       return p
    })
    setProjectorPartsData(updated)
  }

  const saveProjectorPartsOnBlur = () => {
    saveDataFile("projector", projectorPartsData, true) // silent
  }

  const addNewPartsProjectorModel = () => {
    if (!newPartsProjectorModel.trim()) return
    // Since parts list is flat, we don't really 'create' a model until we add a part.
    // Ideally we switch selection to this new model so user can add parts.
    setSelectedPartsProjector(newPartsProjectorModel.trim())
    setNewPartsProjectorModel("")
  }

  const removeProjectorModelFromParts = (model: string) => {
    if (!confirm(`Are you sure you want to delete all parts for ${model}?`)) return
    const updated = projectorPartsData.filter(p => p.projector_model !== model)
    saveDataFile("projector", updated)
    if (selectedPartsProjector === model) {
      setSelectedPartsProjector(null)
    }
  }

  // Lamp models specific functions
  const addLampModel = (projectorModelIndex: number) => {
    const value = newLampModelValue[projectorModelIndex]?.trim()
    if (!value) return

    const updated = [...lampModelsData]
    if (updated[projectorModelIndex] && Array.isArray(updated[projectorModelIndex].Models)) {
      updated[projectorModelIndex] = {
        ...updated[projectorModelIndex],
        Models: [...updated[projectorModelIndex].Models, value]
      }
      saveDataFile("lamp-models", updated)
    }
    
    setNewLampModelValue((prev) => ({ ...prev, [projectorModelIndex]: "" }))
  }

  const removeLampModel = (projectorModelIndex: number, modelIndex: number) => {
    const updated = [...lampModelsData]
    if (updated[projectorModelIndex] && Array.isArray(updated[projectorModelIndex].Models)) {
      updated[projectorModelIndex] = {
        ...updated[projectorModelIndex],
        Models: updated[projectorModelIndex].Models.filter((_, i) => i !== modelIndex)
      }
      saveDataFile("lamp-models", updated)
    }
  }

  const updateLampModel = (projectorModelIndex: number, modelIndex: number, newValue: string) => {
    const updated = [...lampModelsData]
    if (updated[projectorModelIndex] && Array.isArray(updated[projectorModelIndex].Models)) {
      updated[projectorModelIndex] = {
        ...updated[projectorModelIndex],
        Models: updated[projectorModelIndex].Models.map((model, i) => i === modelIndex ? newValue : model)
      }
      setLampModelsData(updated)
    }
  }

  const saveLampModelOnBlur = () => {
    saveDataFile("lamp-models", lampModelsData, true) // silent
  }

  const addProjectorModel = () => {
    const projectorModel = newProjectorModel.trim()
    if (!projectorModel) return

    const updated = [...lampModelsData, { projector_model: projectorModel, Models: [] }]
    saveDataFile("lamp-models", updated)
    setSelectedProjectorIndex(updated.length - 1) // Select the newly added projector
    setNewProjectorModel("")
  }

  const removeProjectorModel = (index: number) => {
    const updated = lampModelsData.filter((_, i) => i !== index)
    saveDataFile("lamp-models", updated)
  }

  const updateProjectorModelName = (index: number, newName: string) => {
    const updated = [...lampModelsData]
    if (updated[index]) {
      updated[index] = { 
        ...updated[index], 
        projector_model: newName,
        Models: updated[index].Models || []
      }
      setLampModelsData(updated)
    }
  }

  const fieldsBySection = fieldConfigs.reduce((acc, field) => {
    const section = field.section || "Other"
    if (!acc[section]) acc[section] = []
    acc[section].push(field)
    return acc
  }, {} as Record<string, FieldConfig[]>)

  // Map sections to their associated data file types
  const sectionDataFileMap: Record<string, "content-player" | "lamp-models" | "software" | "projector" | null> = {
    "Lamp Information": "lamp-models",
    "Software & Screen Information": "software",
    "Content Player & AC Status": "content-player",
    "Recommended Parts": "projector",
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 w-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl font-bold text-foreground">Form Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">Customize form fields, types, and dropdown options</p>
          </div>
          <Button onClick={saveConfig} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-sm">
            <Save className="h-3.5 w-3.5 mr-2" />
            Save Configuration
          </Button>
        </div>

        {/* Form Sections */}
        <div className="space-y-4">
          {FORM_SECTIONS.map((section) => {
            const fields = fieldsBySection[section] || []
            if (fields.length === 0) return null
            const associatedDataFile = sectionDataFileMap[section]

            return (
              <Card key={section} className="border border-border bg-white shadow-sm">
                <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground">{section}</CardTitle>
                    {associatedDataFile && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Has Data File
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {fields.map((field) => (
                    <div key={field.key} className="border border-border rounded-md p-4 bg-background hover:bg-muted/20 transition-colors">
                      {/* Field Header Row */}
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-medium text-foreground truncate">{field.label}</span>
                            {field.required && <span className="text-xs text-red-500 font-medium">Required</span>}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">key: {field.key}</p>
                        </div>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(field.key, { type: value as FieldType })}
                        >
                          <SelectTrigger className="w-36 h-9 text-sm border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text" className="text-sm">Text</SelectItem>
                            <SelectItem value="number" className="text-sm">Number</SelectItem>
                            <SelectItem value="date" className="text-sm">Date</SelectItem>
                            <SelectItem value="textarea" className="text-sm">Textarea</SelectItem>
                            <SelectItem value="select" className="text-sm">Dropdown</SelectItem>
                            <SelectItem value="checkbox" className="text-sm">Checkbox</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Field Settings Row */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.key, { label: e.target.value })}
                            className="h-9 text-sm border-border mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Placeholder</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(field.key, { placeholder: e.target.value })}
                            className="h-9 text-sm border-border mt-1"
                            placeholder="Optional"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer h-9">
                            <input
                              type="checkbox"
                              checked={field.required || false}
                              onChange={(e) => updateField(field.key, { required: e.target.checked })}
                              className="w-4 h-4 rounded border-border"
                            />
                            <span className="text-sm text-muted-foreground">Required</span>
                          </label>
                        </div>
                      </div>

                      {field.type === "number" && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Range (Optional)</Label>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <Input
                              type="number"
                              value={field.min !== undefined ? String(field.min) : ""}
                              onChange={(e) => {
                                const value = e.target.value.trim()
                                updateField(field.key, { 
                                  min: value === "" ? undefined : parseFloat(value) 
                                })
                              }}
                              placeholder="Min"
                              className="h-9 text-sm border-border"
                            />
                            <Input
                              type="number"
                              value={field.max !== undefined ? String(field.max) : ""}
                              onChange={(e) => {
                                const value = e.target.value.trim()
                                updateField(field.key, { 
                                  max: value === "" ? undefined : parseFloat(value) 
                                })
                              }}
                              placeholder="Max"
                              className="h-9 text-sm border-border"
                            />
                          </div>
                        </div>
                      )}

                      {field.type === "select" && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Options</Label>
                          <div className="space-y-2 mt-2">
                            {field.options?.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(field.options || [])]
                                    newOptions[idx] = e.target.value
                                    updateField(field.key, { options: newOptions })
                                  }}
                                  className="h-9 text-sm border-border flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(field.key, idx)}
                                  className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <div className="flex items-center gap-2">
                              <Input
                                value={newOption[field.key] || ""}
                                onChange={(e) => setNewOption((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                placeholder="Add option..."
                                className="h-9 text-sm border-border flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    addOption(field.key)
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(field.key)}
                                className="h-9 w-9 p-0 border-border"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {field.type === "select" && field.defaultValue && (
                        <div className="mt-2">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Default</Label>
                          <Select
                            value={field.defaultValue}
                            onValueChange={(value) => updateField(field.key, { defaultValue: value })}
                          >
                            <SelectTrigger className="h-8 text-xs border-border mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((opt) => (
                                <SelectItem key={opt} value={opt} className="text-xs">
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {field.type === "select" && (
                        <div className="border-t pt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.componentType === "statusSelectWithNote"}
                              onChange={(e) => updateField(field.key, { 
                                componentType: e.target.checked ? "statusSelectWithNote" : undefined 
                              })}
                              className="border-2 border-black"
                            />
                            <Label className="text-sm">Use Status Select With Note Component</Label>
                          </div>
                          
                          {field.componentType === "statusSelectWithNote" && (
                            <div className="space-y-3 pl-4 border-l-2 border-gray-300">
                              <div>
                                <Label className="text-xs text-gray-600">Note Options (shown when status is Issue)</Label>
                                <div className="space-y-2 mt-1">
                                  {field.noteOptions?.map((noteOpt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <Input
                                        value={noteOpt}
                                        onChange={(e) => {
                                          const newNoteOptions = [...(field.noteOptions || [])]
                                          newNoteOptions[idx] = e.target.value
                                          updateField(field.key, { noteOptions: newNoteOptions })
                                        }}
                                        className="border-2 border-black text-sm flex-1"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const newNoteOptions = field.noteOptions?.filter((_, i) => i !== idx) || []
                                          updateField(field.key, { noteOptions: newNoteOptions })
                                        }}
                                        className="border-red-600 text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <div className="flex items-center gap-2">
                                    <Input
                                      placeholder="Add note option"
                                      className="border-2 border-black text-sm flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault()
                                          const value = e.currentTarget.value.trim()
                                          if (value) {
                                            updateField(field.key, { 
                                              noteOptions: [...(field.noteOptions || []), value] 
                                            })
                                            e.currentTarget.value = ""
                                          }
                                        }
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                        const value = input.value.trim()
                                        if (value) {
                                          updateField(field.key, { 
                                            noteOptions: [...(field.noteOptions || []), value] 
                                          })
                                          input.value = ""
                                        }
                                      }}
                                      className="border-black"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs text-gray-600">Issue Trigger Values (Status values that show note)</Label>
                                <div className="space-y-2 mt-1">
                                  {field.issueValues?.map((val, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <Input
                                        value={val}
                                        onChange={(e) => {
                                          const newIssueValues = [...(field.issueValues || [])]
                                          newIssueValues[idx] = e.target.value
                                          updateField(field.key, { issueValues: newIssueValues })
                                        }}
                                        className="border-2 border-black text-sm flex-1"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const newIssueValues = field.issueValues?.filter((_, i) => i !== idx) || []
                                          updateField(field.key, { issueValues: newIssueValues })
                                        }}
                                        className="border-red-600 text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <div className="flex items-center gap-2">
                                    <Input
                                      placeholder="Add issue value (e.g. YES)"
                                      className="border-2 border-black text-sm flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault()
                                          const value = e.currentTarget.value.trim()
                                          if (value) {
                                            updateField(field.key, { 
                                              issueValues: [...(field.issueValues || []), value] 
                                            })
                                            e.currentTarget.value = ""
                                          }
                                        }
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                        const value = input.value.trim()
                                        if (value) {
                                          updateField(field.key, { 
                                            issueValues: [...(field.issueValues || []), value] 
                                          })
                                          input.value = ""
                                        }
                                      }}
                                      className="border-black"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">If empty, defaults to "YES" and "Concern".</p>
                              </div>

                              <div>
                                <Label className="text-xs text-gray-600">Note Default Value</Label>
                                <Input
                                  value={field.noteDefault || ""}
                                  onChange={(e) => updateField(field.key, { noteDefault: e.target.value })}
                                  placeholder="Default note value"
                                  className="border-2 border-black text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Inline Data Editor for Software Versions */}
                  {associatedDataFile === "software" && (
                    <div className="mt-4 pt-4 border-t border-dashed border-border">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-semibold text-primary">Software Versions (Data File)</Label>
                        <span className="text-xs text-muted-foreground">{softwareVersions.length} items</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {softwareVersions.map((version, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded text-sm group">
                            <span>{version}</span>
                            <button
                              type="button"
                              onClick={() => removeDataValue("software", idx)}
                              className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newDataValue["software"] || ""}
                          onChange={(e) => setNewDataValue((prev) => ({ ...prev, "software": e.target.value }))}
                          placeholder="Add version..."
                          className="h-9 text-sm border-border flex-1 max-w-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addDataValue("software")
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addDataValue("software")}
                          className="h-9 px-3 border-border hover:bg-primary hover:text-primary-foreground"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Inline Data Editor for Content Players */}
                  {associatedDataFile === "content-player" && (
                    <div className="mt-4 pt-4 border-t border-dashed border-border">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-semibold text-primary">Content Players (Data File)</Label>
                        <span className="text-xs text-muted-foreground">{contentPlayers.length} items</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {contentPlayers.map((player, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded text-sm group">
                            <span>{player}</span>
                            <button
                              type="button"
                              onClick={() => removeDataValue("content-player", idx)}
                              className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newDataValue["content-player"] || ""}
                          onChange={(e) => setNewDataValue((prev) => ({ ...prev, "content-player": e.target.value }))}
                          placeholder="Add player..."
                          className="h-9 text-sm border-border flex-1 max-w-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addDataValue("content-player")
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addDataValue("content-player")}
                          className="h-9 px-3 border-border hover:bg-primary hover:text-primary-foreground"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Inline Data Editor for Lamp Models - simplified view */}
                  {associatedDataFile === "lamp-models" && (
                    <div className="mt-4 pt-4 border-t border-dashed border-border">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-semibold text-primary">Lamp Models (Data File)</Label>
                        <span className="text-[10px] text-muted-foreground">{lampModelsData.length} projectors</span>
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 max-w-xs">
                          <Select
                            value={selectedProjectorIndex !== null ? String(selectedProjectorIndex) : ""}
                            onValueChange={(value) => setSelectedProjectorIndex(value ? parseInt(value, 10) : null)}
                          >
                            <SelectTrigger className="h-7 text-xs border-border">
                              <SelectValue placeholder="Select projector..." />
                            </SelectTrigger>
                            <SelectContent>
                              {lampModelsData.map((projectorData, idx) => (
                                <SelectItem key={idx} value={String(idx)} className="text-xs">
                                  {projectorData.projector_model} ({projectorData.Models?.length || 0} lamps)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-1.5">
                          <Input
                            value={newProjectorModel}
                            onChange={(e) => setNewProjectorModel(e.target.value)}
                            placeholder="New projector..."
                            className="h-7 text-xs border-border w-32"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addProjectorModel()
                              }
                            }}
                          />
                          <Button type="button" variant="outline" size="sm" onClick={addProjectorModel} className="h-7 px-2 border-border">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {selectedProjectorIndex !== null && lampModelsData[selectedProjectorIndex] && (
                        <div className="mt-2 p-2 bg-muted/30 rounded">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {lampModelsData[selectedProjectorIndex].Models?.map((model, modelIdx) => (
                              <div key={modelIdx} className="flex items-center gap-1 bg-background px-2 py-1 rounded text-xs group border border-border">
                                <span>{model}</span>
                                <button
                                  type="button"
                                  onClick={() => removeLampModel(selectedProjectorIndex, modelIdx)}
                                  className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-1.5">
                            <Input
                              value={newLampModelValue[selectedProjectorIndex] || ""}
                              onChange={(e) => setNewLampModelValue((prev) => ({ ...prev, [selectedProjectorIndex]: e.target.value }))}
                              placeholder="Add lamp model..."
                              className="h-7 text-xs border-border flex-1"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  addLampModel(selectedProjectorIndex)
                                }
                              }}
                            />
                            <Button type="button" variant="outline" size="sm" onClick={() => addLampModel(selectedProjectorIndex)} className="h-7 px-2 border-border">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Data Files Management Section - Projector Parts (Advanced) */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Projector Parts Database</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage parts by projector model. 
                <span className="text-[10px] ml-2 text-primary">(Software, Content Players & Lamp Models are edited inline above)</span>
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLoadingDataFiles(true)
                const loadDataFiles = async () => {
                  try {
                     const results = await Promise.all([
                      fetch("/api/admin/data-files/content-player?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
                      fetch("/api/admin/data-files/lamp-models?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
                      fetch("/api/admin/data-files/software?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
                      fetch("/api/admin/data-files/projector?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
                    ])
                    const [contentRes, lampRes, softwareRes, projectorRes] = results

                    if (contentRes.ok) {
                      const data = await contentRes.json()
                      setContentPlayers(data.values || [])
                    }
                    if (lampRes.ok) {
                      const data = await lampRes.json()
                      setLampModelsData(data.data || [])
                    }
                    if (softwareRes.ok) {
                      const data = await softwareRes.json()
                      setSoftwareVersions(data.values || [])
                    }
                    if (projectorRes.ok) {
                      const data = await projectorRes.json()
                      setProjectorPartsData(data.data || [])
                    }
                  } catch (error) {
                    console.error("Failed to refresh data files:", error)
                  } finally {
                    setLoadingDataFiles(false)
                  }
                }
                loadDataFiles()
              }}
              className="border-border h-9 text-sm"
              disabled={loadingDataFiles}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loadingDataFiles ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Content Players */}
            <Card className="border border-border bg-white shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                <CardTitle className="text-sm font-semibold text-foreground">Content Players</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {loadingDataFiles ? (
                  <p className="text-xs text-muted-foreground">Loading...</p>
                ) : contentPlayers.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No items. Add below.</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">{contentPlayers.length} items</p>
                )}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {contentPlayers.map((value, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Input
                        value={value}
                        onChange={(e) => updateDataValue("content-player", idx, e.target.value)}
                        onBlur={() => saveDataValueOnBlur("content-player")}
                        className="h-7 text-xs border-border flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDataValue("content-player", idx)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Input
                    value={newDataValue["content-player"] || ""}
                    onChange={(e) => setNewDataValue((prev) => ({ ...prev, "content-player": e.target.value }))}
                    placeholder="Add new content player"
                    className="border-2 border-black text-sm flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addDataValue("content-player")
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDataValue("content-player")}
                    className="border-black"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lamp Models */}
            <Card className="border-2 border-black col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Lamp Models (by Projector Model)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDataFiles ? (
                  <p className="text-sm text-gray-500">Loading lamp models...</p>
                ) : lampModelsData.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No projector models found. Add one below.</p>
                ) : (
                  <>
                    {/* Projector Selection Dropdown */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-black">Select Projector Model</Label>
                      <Select
                        value={selectedProjectorIndex !== null ? String(selectedProjectorIndex) : ""}
                        onValueChange={(value) => setSelectedProjectorIndex(value ? parseInt(value, 10) : null)}
                      >
                        <SelectTrigger className="border-2 border-black">
                          <SelectValue placeholder="Choose a projector model..." />
                        </SelectTrigger>
                        <SelectContent>
                          {lampModelsData.map((projectorData, idx) => (
                            <SelectItem key={idx} value={String(idx)}>
                              {projectorData.projector_model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selected Projector's Lamp Models */}
                    {selectedProjectorIndex !== null && lampModelsData[selectedProjectorIndex] && (
                      <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b">
                          <div className="flex items-center gap-2 flex-1">
                            <Label className="text-sm font-semibold text-black">Projector: {lampModelsData[selectedProjectorIndex].projector_model}</Label>
                            <Input
                              value={lampModelsData[selectedProjectorIndex].projector_model}
                              onChange={(e) => updateProjectorModelName(selectedProjectorIndex, e.target.value)}
                              onBlur={() => saveLampModelOnBlur()}
                              className="border-2 border-black text-sm flex-1 max-w-xs"
                              placeholder="Projector Model"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              removeProjectorModel(selectedProjectorIndex)
                              setSelectedProjectorIndex(null)
                            }}
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700">Lamp Models</Label>
                          {lampModelsData[selectedProjectorIndex].Models && lampModelsData[selectedProjectorIndex].Models.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {lampModelsData[selectedProjectorIndex].Models.map((model, modelIdx) => (
                                <div key={modelIdx} className="flex items-center gap-2">
                                  <Input
                                    value={model}
                                    onChange={(e) => updateLampModel(selectedProjectorIndex, modelIdx, e.target.value)}
                                    onBlur={() => saveLampModelOnBlur()}
                                    className="border-2 border-black text-sm flex-1"
                                    placeholder="Lamp Model"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeLampModel(selectedProjectorIndex, modelIdx)}
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No lamp models for this projector</p>
                          )}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Input
                              value={newLampModelValue[selectedProjectorIndex] || ""}
                              onChange={(e) => setNewLampModelValue((prev) => ({ ...prev, [selectedProjectorIndex]: e.target.value }))}
                              placeholder="Add lamp model"
                              className="border-2 border-black text-sm flex-1"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  addLampModel(selectedProjectorIndex)
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addLampModel(selectedProjectorIndex)}
                              className="border-black"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Input
                    value={newProjectorModel}
                    onChange={(e) => setNewProjectorModel(e.target.value)}
                    placeholder="Add new projector model (e.g., CP2220)"
                    className="border-2 border-black text-sm flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addProjectorModel()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProjectorModel}
                    className="border-black"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Software Versions */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Software Versions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingDataFiles ? (
                  <p className="text-sm text-gray-500">Loading software versions...</p>
                ) : softwareVersions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No software versions found. Add one below.</p>
                ) : (
                  <p className="text-xs text-gray-500 mb-2">{softwareVersions.length} items</p>
                )}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {softwareVersions.map((value, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={value}
                        onChange={(e) => updateDataValue("software", idx, e.target.value)}
                        onBlur={() => saveDataValueOnBlur("software")}
                        className="border-2 border-black text-sm flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDataValue("software", idx)}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Input
                    value={newDataValue["software"] || ""}
                    onChange={(e) => setNewDataValue((prev) => ({ ...prev, "software": e.target.value }))}
                    placeholder="Add new software version"
                    className="border-2 border-black text-sm flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addDataValue("software")
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDataValue("software")}
                    className="border-black"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Projector Parts */}
            <Card className="border-2 border-black col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Recommended Parts (by Projector Model)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDataFiles ? (
                  <p className="text-sm text-gray-500">Loading projector parts...</p>
                ) : (
                  <>
                    {/* Projector Selection Dropdown */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-black">Select Projector Model</Label>
                      <Select
                        value={selectedPartsProjector || ""}
                        onValueChange={(value) => setSelectedPartsProjector(value)}
                      >
                        <SelectTrigger className="border-2 border-black">
                          <SelectValue placeholder="Choose a projector model..." />
                        </SelectTrigger>
                        <SelectContent>
                          {uniquePartsModels.map((model, idx) => (
                            <SelectItem key={idx} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selected Projector's Parts */}
                    {selectedPartsProjector && (
                      <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b">
                          <Label className="text-sm font-semibold text-black">Model: {selectedPartsProjector}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProjectorModelFromParts(selectedPartsProjector)}
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove All Parts for Model
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-5 gap-2 font-semibold text-xs text-gray-600 mb-1">
                             <div className="col-span-2">Part Description</div>
                             <div className="col-span-2">Part Number</div>
                             <div className="col-span-1">Action</div>
                          </div>
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {projectorPartsData
                              .filter(p => p.projector_model === selectedPartsProjector)
                              .map((part, pIdx) => (
                                <div key={pIdx} className="grid grid-cols-5 gap-2 items-center">
                                  <Input
                                    value={part.description}
                                    onChange={(e) => updateProjectorPart(part, "description", e.target.value)}
                                    onBlur={saveProjectorPartsOnBlur}
                                    className="col-span-2 border-2 border-black text-sm"
                                    placeholder="Description"
                                  />
                                  <Input
                                    value={part.part_number}
                                    onChange={(e) => updateProjectorPart(part, "part_number", e.target.value)}
                                    onBlur={saveProjectorPartsOnBlur}
                                    className="col-span-2 border-2 border-black text-sm"
                                    placeholder="Part Number"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeProjectorPart(part)}
                                    className="col-span-1 border-red-600 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                          
                          {/* Add New Part Row */}
                          <div className="grid grid-cols-5 gap-2 pt-3 border-t mt-2">
                             <Input
                               value={newPartValue.description}
                               onChange={(e) => setNewPartValue(prev => ({ ...prev, description: e.target.value }))}
                               className="col-span-2 border-2 border-black text-sm"
                               placeholder="New Part Description"
                             />
                             <Input
                               value={newPartValue.part_number}
                               onChange={(e) => setNewPartValue(prev => ({ ...prev, part_number: e.target.value }))}
                               className="col-span-2 border-2 border-black text-sm"
                               placeholder="New Part Number"
                               onKeyDown={(e) => {
                                 if (e.key === "Enter") addProjectorPart()
                               }}
                             />
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               onClick={addProjectorPart}
                               className="col-span-1 border-black"
                               disabled={!newPartValue.description || !newPartValue.part_number}
                             >
                               <Plus className="h-4 w-4" />
                             </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add New Model Section */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Input
                        value={newPartsProjectorModel}
                        onChange={(e) => setNewPartsProjectorModel(e.target.value)}
                        placeholder="Add new projector model for parts (e.g. CP4230)"
                        className="border-2 border-black text-sm flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addNewPartsProjectorModel()
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addNewPartsProjectorModel}
                        className="border-black"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
