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
  const [newDataValue, setNewDataValue] = useState<Record<string, string>>({})
  const [newLampModelValue, setNewLampModelValue] = useState<Record<string, string>>({})
  const [newProjectorModel, setNewProjectorModel] = useState("")
  const [selectedProjectorIndex, setSelectedProjectorIndex] = useState<number | null>(null)
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
        const [contentRes, lampRes, softwareRes] = await Promise.all([
          fetch("/api/admin/data-files/content-player?t=" + Date.now(), { 
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/admin/data-files/lamp-models?t=" + Date.now(), { 
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/admin/data-files/software?t=" + Date.now(), { 
            credentials: "include",
            cache: "no-store",
          }),
        ])

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
      } catch (error) {
        console.error("Failed to load data files:", error)
      } finally {
        setLoadingDataFiles(false)
      }
    }
    loadDataFiles()
  }, [])

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
        alert(`Form configuration saved successfully! ${result.savedFields || fieldConfigs.length} fields saved.`)
      } else {
        const errorText = await res.text()
        console.error("Failed to save config - Response:", errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        alert(`Failed to save: ${errorData.error || "Unknown error"}\nDetails: ${errorData.details || "No details provided"}`)
      }
    } catch (error) {
      console.error("Failed to save form config - Exception:", error)
      alert(`Failed to save form configuration: ${error instanceof Error ? error.message : String(error)}`)
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
  const saveDataFile = async (fileType: "content-player" | "lamp-models" | "software", values: string[] | Array<{ projector_model: string; Models: string[] }>) => {
    try {
      const res = await fetch(`/api/admin/data-files/${fileType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(fileType === "lamp-models" ? { data: values } : { values }),
      })

      if (res.ok) {
        const result = await res.json()
        alert(`${fileType} saved successfully! ${result.saved} items saved.`)
        
        // Update local state
        if (fileType === "content-player") setContentPlayers(values as string[])
        if (fileType === "lamp-models") setLampModelsData(values as Array<{ projector_model: string; Models: string[] }>)
        if (fileType === "software") setSoftwareVersions(values as string[])
      } else {
        const errorText = await res.text()
        console.error(`Failed to save ${fileType} - Response:`, errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        alert(`Failed to save: ${errorData.error || "Unknown error"}\nDetails: ${errorData.details || ""}`)
      }
    } catch (error) {
      console.error(`Failed to save ${fileType}:`, error)
      alert(`Failed to save ${fileType}: ${error instanceof Error ? error.message : String(error)}`)
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
      saveDataFile(fileType, contentPlayers)
    } else if (fileType === "software") {
      saveDataFile(fileType, softwareVersions)
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
    saveDataFile("lamp-models", lampModelsData)
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

  return (
    <div className="min-h-screen bg-white p-6 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black">Form Builder</h1>
            <p className="text-gray-600 mt-2">Customize form fields, types, and dropdown options</p>
          </div>
          <Button onClick={saveConfig} className="bg-black text-white hover:bg-gray-800">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>

        <div className="space-y-6">
          {FORM_SECTIONS.map((section) => {
            const fields = fieldsBySection[section] || []
            if (fields.length === 0) return null

            return (
              <Card key={section} className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black">{section}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.key} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="font-semibold text-black">{field.label}</Label>
                          <p className="text-xs text-gray-500 mt-1">Field: {field.key}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateField(field.key, { type: value as FieldType })}
                          >
                            <SelectTrigger className="w-40 border-2 border-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text Input</SelectItem>
                              <SelectItem value="number">Number Input</SelectItem>
                              <SelectItem value="date">Date Input</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.key, { label: e.target.value })}
                            className="border-2 border-black text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Placeholder</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(field.key, { placeholder: e.target.value })}
                            className="border-2 border-black text-sm"
                            placeholder="Optional placeholder"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.required || false}
                          onChange={(e) => updateField(field.key, { required: e.target.checked })}
                          className="border-2 border-black"
                        />
                        <Label className="text-sm">Required field</Label>
                      </div>

                      {field.type === "number" && (
                        <div className="border-t pt-3 space-y-2">
                          <Label className="text-sm font-semibold">Number Range (Optional)</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-gray-600">Minimum Value</Label>
                              <Input
                                type="number"
                                value={field.min !== undefined ? String(field.min) : ""}
                                onChange={(e) => {
                                  const value = e.target.value.trim()
                                  updateField(field.key, { 
                                    min: value === "" ? undefined : parseFloat(value) 
                                  })
                                }}
                                placeholder="No minimum"
                                className="border-2 border-black text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Maximum Value</Label>
                              <Input
                                type="number"
                                value={field.max !== undefined ? String(field.max) : ""}
                                onChange={(e) => {
                                  const value = e.target.value.trim()
                                  updateField(field.key, { 
                                    max: value === "" ? undefined : parseFloat(value) 
                                  })
                                }}
                                placeholder="No maximum"
                                className="border-2 border-black text-sm"
                              />
                            </div>
                          </div>
                          {(field.min !== undefined || field.max !== undefined) && (
                            <p className="text-xs text-gray-500">
                              Range: {field.min !== undefined ? field.min : "no min"} - {field.max !== undefined ? field.max : "no max"}
                            </p>
                          )}
                        </div>
                      )}

                      {field.type === "select" && (
                        <div className="border-t pt-3 space-y-2">
                          <Label className="text-sm font-semibold">Dropdown Options</Label>
                          <div className="space-y-2">
                            {field.options?.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(field.options || [])]
                                    newOptions[idx] = e.target.value
                                    updateField(field.key, { options: newOptions })
                                  }}
                                  className="border-2 border-black text-sm flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeOption(field.key, idx)}
                                  className="border-red-600 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <div className="flex items-center gap-2">
                              <Input
                                value={newOption[field.key] || ""}
                                onChange={(e) => setNewOption((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                placeholder="Add new option"
                                className="border-2 border-black text-sm flex-1"
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
                                className="border-black"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {field.type === "select" && field.defaultValue && (
                        <div>
                          <Label className="text-xs text-gray-600">Default Value</Label>
                          <Select
                            value={field.defaultValue}
                            onValueChange={(value) => updateField(field.key, { defaultValue: value })}
                          >
                            <SelectTrigger className="border-2 border-black text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((opt) => (
                                <SelectItem key={opt} value={opt}>
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
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Data Files Management Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-black">Manage Dropdown Data Files</h2>
              <p className="text-gray-600 mt-2">Edit values for Content Players, Lamp Models, and Software Versions</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLoadingDataFiles(true)
                const loadDataFiles = async () => {
                  try {
                    const [contentRes, lampRes, softwareRes] = await Promise.all([
                      fetch("/api/admin/data-files/content-player?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
                      fetch("/api/admin/data-files/lamp-models?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
                      fetch("/api/admin/data-files/software?t=" + Date.now(), { credentials: "include", cache: "no-store" }),
                    ])
                    if (contentRes.ok) {
                      const data = await contentRes.json()
                      setContentPlayers(data.values || [])
                    } else {
                      console.error("Failed to refresh content players:", contentRes.status)
                    }
                    if (lampRes.ok) {
                      const data = await lampRes.json()
                      setLampModelsData(data.data || [])
                    } else {
                      console.error("Failed to refresh lamp models:", lampRes.status)
                    }
                    if (softwareRes.ok) {
                      const data = await softwareRes.json()
                      setSoftwareVersions(data.values || [])
                    } else {
                      console.error("Failed to refresh software versions:", softwareRes.status)
                    }
                  } catch (error) {
                    console.error("Failed to refresh data files:", error)
                  } finally {
                    setLoadingDataFiles(false)
                  }
                }
                loadDataFiles()
              }}
              className="border-2 border-black"
              disabled={loadingDataFiles}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingDataFiles ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Content Players */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-black">Content Players</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingDataFiles ? (
                  <p className="text-sm text-gray-500">Loading content players...</p>
                ) : contentPlayers.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No content players found. Add one below.</p>
                ) : (
                  <p className="text-xs text-gray-500 mb-2">{contentPlayers.length} items</p>
                )}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {contentPlayers.map((value, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={value}
                        onChange={(e) => updateDataValue("content-player", idx, e.target.value)}
                        onBlur={() => saveDataValueOnBlur("content-player")}
                        className="border-2 border-black text-sm flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDataValue("content-player", idx)}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
          </div>
        </div>
      </div>
    </div>
  )
}
