import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useFormConfig } from '@/hooks/use-form-config'
import { DynamicFormField } from './dynamic-form-field'

type IssueNotes = Record<string, string>
type UploadedImage = { name: string; url: string; size?: number }
type ProjectorPart = {
  projector_model: string
  part_number: string
  description: string
}
type RecommendedPart = {
  part_number: string
  description: string
}
type RecordWorkForm = ReturnType<typeof createInitialFormData>

const OPTICAL_FIELDS = ['reflector', 'uvFilter', 'integratorRod', 'coldMirror', 'foldMirror'] as const
const ELECTRONIC_FIELDS = ['touchPanel', 'evbBoard', 'ImcbBoard', 'pibBoard', 'IcpBoard', 'imbSBoard'] as const
const MECHANICAL_FIELDS = ['acBlowerVane', 'extractorVane', 'lightEngineFans', 'cardCageFans', 'radiatorFanPump'] as const
const COLOR_ACCURACY = [
  { name: 'White', fields: ['white2Kx', 'white2Ky', 'white2Kfl', 'white4Kx', 'white4Ky', 'white4Kfl'] },
  { name: 'Red', fields: ['red2Kx', 'red2Ky', 'red2Kfl', 'red4Kx', 'red4Ky', 'red4Kfl'] },
  { name: 'Green', fields: ['green2Kx', 'green2Ky', 'green2Kfl', 'green4Kx', 'green4Ky', 'green4Kfl'] },
  { name: 'Blue', fields: ['blue2Kx', 'blue2Ky', 'blue2Kfl', 'blue4Kx', 'blue4Ky', 'blue4Kfl'] },
] as const
const IMAGE_EVAL_FIELDS = [
  { field: 'focusBoresight', label: 'Focus/Boresight' },
  { field: 'integratorPosition', label: 'Integrator Position' },
  { field: 'spotsOnScreen', label: 'Spots on Screen' },
  { field: 'screenCroppingOk', label: 'Screen Cropping' },
  { field: 'convergenceOk', label: 'Convergence' },
  { field: 'channelsCheckedOk', label: 'Channels Checked' },
] as const

const createInitialFormData = () => ({
  cinemaName: '',
  date: new Date().toISOString().split('T')[0] ?? '',
  address: '',
  contactDetails: '',
  location: '',
  screenNumber: '',
  serviceVisitType: '',
  projectorModel: '',
  projectorSerialNumber: '',
  projectorRunningHours: '',
  reflector: 'OK',
  uvFilter: 'OK',
  integratorRod: 'OK',
  coldMirror: 'OK',
  foldMirror: 'OK',
  touchPanel: 'OK',
  evbBoard: 'OK',
  ImcbBoard: 'OK',
  pibBoard: 'OK',
  IcpBoard: 'OK',
  imbSBoard: 'OK',
  reflectorNote: '',
  uvFilterNote: '',
  integratorRodNote: '',
  coldMirrorNote: '',
  foldMirrorNote: '',
  touchPanelNote: '',
  evbBoardNote: '',
  ImcbBoardNote: '',
  pibBoardNote: '',
  IcpBoardNote: '',
  imbSBoardNote: '',
  serialNumberVerified: '',
  serialNumberVerifiedNote: '',
  AirIntakeLadRad: '',
  AirIntakeLadRadNote: '',
  coolantLevelColor: '',
  coolantLevelColorNote: '',
  lightEngineWhite: '',
  lightEngineRed: '',
  lightEngineGreen: '',
  lightEngineBlue: '',
  lightEngineBlack: '',
  lightEngineWhiteNote: '',
  lightEngineRedNote: '',
  lightEngineGreenNote: '',
  lightEngineBlueNote: '',
  lightEngineBlackNote: '',
  acBlowerVane: 'OK',
  extractorVane: 'OK',
  exhaustCfm: '',
  lightEngineFans: 'OK',
  cardCageFans: 'OK',
  radiatorFanPump: 'OK',
  pumpConnectorHose: 'OK',
  securityLampHouseLock: 'OK',
  securityLampHouseLockNote: '',
  lampLocMechanism: 'OK',
  acBlowerVaneNote: '',
  extractorVaneNote: '',
  exhaustCfmNote: '',
  lightEngineFansNote: '',
  cardCageFansNote: '',
  radiatorFanPumpNote: '',
  pumpConnectorHoseNote: '',
  lampLocMechanismNote: '',
  projectorPlacementEnvironment: '',
  softwareVersion: '',
  screenHeight: '',
  screenWidth: '',
  flatHeight: '',
  flatWidth: '',
  screenGain: '',
  screenMake: '',
  throwDistance: '',
  lampMakeModel: '',
  lampTotalRunningHours: '',
  lampCurrentRunningHours: '',
  pvVsN: '',
  pvVsE: '',
  nvVsE: '',
  flLeft: '',
  flRight: '',
  contentPlayerModel: '',
  acStatus: '',
  leStatus: '',
  remarks: '',
  lightEngineSerialNumber: '',
  white2Kx: '',
  white2Ky: '',
  white2Kfl: '',
  white4Kx: '',
  white4Ky: '',
  white4Kfl: '',
  red2Kx: '',
  red2Ky: '',
  red2Kfl: '',
  red4Kx: '',
  red4Ky: '',
  red4Kfl: '',
  green2Kx: '',
  green2Ky: '',
  green2Kfl: '',
  green4Kx: '',
  green4Ky: '',
  green4Kfl: '',
  blue2Kx: '',
  blue2Ky: '',
  blue2Kfl: '',
  blue4Kx: '',
  blue4Ky: '',
  blue4Kfl: '',
  BW_Step_10_2Kx: '',
  BW_Step_10_2Ky: '',
  BW_Step_10_2Kfl: '',
  BW_Step_10_4Kx: '',
  BW_Step_10_4Ky: '',
  BW_Step_10_4Kfl: '',
  focusBoresight: '',
  integratorPosition: '',
  spotsOnScreen: '',
  screenCroppingOk: '',
  convergenceOk: '',
  channelsCheckedOk: '',
  pixelDefects: '',
  imageVibration: '',
  liteloc: '',
  hcho: '',
  tvoc: '',
  pm1: '',
  pm2_5: '',
  pm10: '',
  temperature: '',
  humidity: '',
  airPollutionLevel: '',
  startTime: '',
  endTime: '',
  signatures: '',
  reportGenerated: false,
  reportUrl: '',
  photosDriveLink: '',
  issueNotes: {} as IssueNotes,
  recommendedParts: [] as RecommendedPart[],
})

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4 pb-4 border-b-2 border-black last:border-b-0">
    <h3 className="font-bold text-black mb-3 text-sm sm:text-base">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
)

const FormRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">{children}</div>
)

const FormField = ({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) => (
  <div>
    <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
      {label} {required && '*'}
    </label>
    {children}
  </div>
)

export default function RecordWorkStep({ data, onNext, onBack }: any) {
  const [brokenImages, setBrokenImages] = useState<UploadedImage[]>([])
  const [referenceImages, setReferenceImages] = useState<UploadedImage[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [partsData, setPartsData] = useState<ProjectorPart[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPartIds, setSelectedPartIds] = useState<Set<string>>(new Set())
  const [lampModels, setLampModels] = useState<string[]>([])
  const [softwareVersions, setSoftwareVersions] = useState<string[]>([])
  const [contentPlayers, setContentPlayers] = useState<string[]>([])
  const brokenImagesRef = useRef<UploadedImage[]>([])
  const referenceImagesRef = useRef<UploadedImage[]>([])
  const { config: formConfig, loading: configLoading } = useFormConfig()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<RecordWorkForm>({
    defaultValues: createInitialFormData(),
  })

  const safeDate = (dateStr: any, fallback: string) => {
    if (!dateStr || typeof dateStr !== 'string') return fallback
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? fallback : (d.toISOString().split('T')[0] ?? fallback)
  }

  useEffect(() => {
    const initial = createInitialFormData()
    if (data?.workDetails) {
      reset({
        ...initial,
        ...data.workDetails,
        // Override with selectedService values to ensure they take precedence
        cinemaName: data.selectedService?.site || data.workDetails.cinemaName || initial.cinemaName,
        date: safeDate(data.selectedService?.date, data.workDetails.date || initial.date),
        address: data.selectedService?.address || data.workDetails.address || initial.address,
        contactDetails: data.selectedService?.contactDetails || data.workDetails.contactDetails || initial.contactDetails,
        projectorModel: data.selectedService?.projectorModel || data.workDetails.projectorModel || initial.projectorModel,
        projectorSerialNumber: data.selectedService?.projector || data.workDetails.projectorSerialNumber || initial.projectorSerialNumber,
        screenNumber: data.selectedService?.screenNumber || data.workDetails.screenNumber || initial.screenNumber,
        issueNotes: data.workDetails.issueNotes || {},
        recommendedParts: data.workDetails.recommendedParts || [],
      })
    } else if (typeof window !== 'undefined' && data?.selectedService?.id) {
      const storageKey = `recordWorkFormData_${data.selectedService.id}`
      const savedFormData = localStorage.getItem(storageKey)
      if (savedFormData) {
        const parsed = JSON.parse(savedFormData)
        reset({
          ...initial,
          ...parsed,
          // Override with selectedService values to ensure they take precedence
          cinemaName: data.selectedService?.site || parsed.cinemaName || initial.cinemaName,
          date: safeDate(data.selectedService?.date, parsed.date || initial.date),
          address: data.selectedService?.address || parsed.address || initial.address,
          contactDetails: data.selectedService?.contactDetails || parsed.contactDetails || initial.contactDetails,
          projectorModel: data.selectedService?.projectorModel || parsed.projectorModel || initial.projectorModel,
          projectorSerialNumber: data.selectedService?.projector || parsed.projectorSerialNumber || initial.projectorSerialNumber,
          screenNumber: data.selectedService?.screenNumber || parsed.screenNumber || initial.screenNumber,
          issueNotes: parsed.issueNotes || {},
          recommendedParts: parsed.recommendedParts || [],
        })
      } else {
        // No saved data, but we have service details
        reset({
          ...initial,
          cinemaName: data.selectedService?.site || initial.cinemaName,
          date: safeDate(data.selectedService?.date, initial.date),
          address: data.selectedService?.address || initial.address,
          contactDetails: data.selectedService?.contactDetails || initial.contactDetails,
          projectorModel: data.selectedService?.projectorModel || initial.projectorModel,
          projectorSerialNumber: data.selectedService?.projector || initial.projectorSerialNumber,
          screenNumber: data.selectedService?.screenNumber || initial.screenNumber,
        })
      }
    }

    if (data?.workImages) {
      if (Array.isArray(data.workImages)) {
        setReferenceImages(data.workImages)
        setBrokenImages([])
      } else {
        setBrokenImages(data.workImages.broken || [])
        setReferenceImages(data.workImages.other || [])
      }
    } else if (typeof window !== 'undefined' && data?.selectedService?.id) {
      const storageKey = `recordWorkImages_${data.selectedService.id}`
      const savedImages = localStorage.getItem(storageKey)
      if (savedImages) {
        const parsed = JSON.parse(savedImages)
        setBrokenImages(parsed.broken || [])
        setReferenceImages(parsed.other || [])
      }
    }
  }, [data, reset])

  useEffect(() => {
    if (typeof window === 'undefined' || !data?.selectedService?.id) return
    const subscription = watch((value) => {
      const storageKey = `recordWorkFormData_${data.selectedService.id}`
      localStorage.setItem(storageKey, JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [watch, data?.selectedService?.id])

  useEffect(() => {
    brokenImagesRef.current = brokenImages
  }, [brokenImages])

  useEffect(() => {
    referenceImagesRef.current = referenceImages
  }, [referenceImages])

  // Load projector parts data
  useEffect(() => {
    const loadPartsData = async () => {
      try {
        const response = await fetch('/data/Projector.json')
        if (response.ok) {
          const data = await response.json()
          setPartsData(data.projector_parts || [])
        }
      } catch (error) {
        console.error('Failed to load projector parts data:', error)
      }
    }
    loadPartsData()
  }, [])

  // Load lamp models for dropdown
  useEffect(() => {
    const loadLampModels = async () => {
      try {
        const response = await fetch('/data/Lamp_Models.json')
        if (!response.ok) return
        const text = await response.text()
        const matches = [...text.matchAll(/"Lamp Model"\s*:\s*"([^"]+)"/g)].map((m) => m[1])
        const cleaned = matches.filter((m): m is string => typeof m === 'string' && m.toUpperCase() !== 'NA')
        const unique = Array.from(new Set(cleaned))
        setLampModels(unique)
      } catch (error) {
        console.error('Failed to load lamp models:', error)
      }
    }
    loadLampModels()
  }, [])

  // Load software versions for dropdown
  useEffect(() => {
    const loadSoftwareVersions = async () => {
      try {
        const response = await fetch('/data/Software.json')
        if (!response.ok) return
        const text = await response.text()
        const matches = [...text.matchAll(/"Software Version"\s*:\s*"([^"]+)"/g)].map((m) => m[1])
        const cleaned = matches.filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
        const unique = Array.from(new Set(cleaned))
        setSoftwareVersions(unique)
      } catch (error) {
        console.error('Failed to load software versions:', error)
      }
    }
    loadSoftwareVersions()
  }, [])

  // Load content players for dropdown
  useEffect(() => {
    const loadContentPlayers = async () => {
      try {
        const response = await fetch('/data/Content_Player.json')
        if (!response.ok) return
        const text = await response.text()
        const matches = [...text.matchAll(/"Content Player"\s*:\s*"([^"]+)"/g)].map((m) => m[1])
        const cleaned = matches.filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
        const unique = Array.from(new Set(cleaned))
        setContentPlayers(unique)
      } catch (error) {
        console.error('Failed to load content players:', error)
      }
    }
    loadContentPlayers()
  }, [])

  // Sync selected parts when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      const currentParts = getValues('recommendedParts') || []
      if (Array.isArray(currentParts) && currentParts.length > 0) {
        setSelectedPartIds(new Set(currentParts.map((p: RecommendedPart) => p.part_number)))
      } else {
        setSelectedPartIds(new Set())
      }
    }
  }, [isDialogOpen, getValues])

  const persistImages = (broken: UploadedImage[], other: UploadedImage[]) => {
    setBrokenImages(broken)
    setReferenceImages(other)
    if (typeof window !== 'undefined' && data?.selectedService?.id) {
      const storageKey = `recordWorkImages_${data.selectedService.id}`
      localStorage.setItem(storageKey, JSON.stringify({ broken, other }))
    }
  }

  const uploadToBlob = async (file: File, category: 'broken' | 'reference'): Promise<UploadedImage> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', category === 'broken' ? 'broken-images' : 'reference-images')

    const response = await fetch('/api/blob/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const message = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(message.error || 'Upload failed')
    }

    const result = await response.json()
    return { name: file.name, url: result.url, size: result.size }
  }

  const handleImageUpload = async (type: 'broken' | 'reference', files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploads = await Promise.all(Array.from(files).map((file) => uploadToBlob(file, type)))
      setImageError(null)
      const nextBroken = type === 'broken' ? [...brokenImagesRef.current, ...uploads] : brokenImagesRef.current
      const nextReference =
        type === 'reference' ? [...referenceImagesRef.current, ...uploads] : referenceImagesRef.current
      persistImages(nextBroken, nextReference)
    } catch (error) {
      console.error('Image upload failed:', error)
      setImageError('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (type: 'broken' | 'reference', index: number) => {
    if (type === 'broken') {
      const newImages = [...brokenImages]
      newImages.splice(index, 1)
      setBrokenImages(newImages)
      persistImages(newImages, referenceImages)
    } else {
      const newImages = [...referenceImages]
      newImages.splice(index, 1)
      setReferenceImages(newImages)
      persistImages(brokenImages, newImages)
    }
  }

  const handleResetForm = () => {
    if (typeof window !== 'undefined' && !window.confirm('Reset all saved data?')) {
      return
    }
    reset(createInitialFormData())
    persistImages([], [])
    setImageError(null)
    if (typeof window !== 'undefined' && data?.selectedService?.id) {
      localStorage.removeItem(`recordWorkFormData_${data.selectedService.id}`)
      localStorage.removeItem(`recordWorkImages_${data.selectedService.id}`)
    }
  }

  const clearIssueNote = (field: string) => {
    const currentNotes = getValues('issueNotes') || {}
    if (currentNotes[field]) {
      const { [field]: _removed, ...rest } = currentNotes
      setValue('issueNotes', rest as IssueNotes, { shouldDirty: true })
    }
  }

  const hasRequiredImages = brokenImages.length > 0 && referenceImages.length > 0

  // Filter parts by projector model
  const projectorModel = watch('projectorModel')
  const filteredParts = partsData.filter(
    (part) => part.projector_model.toLowerCase() === projectorModel?.toLowerCase()
  )

  const isOutOfRange = (value: unknown, min: number, max: number) => {
    if (value === undefined || value === null || value === '') return false
    const num = Number(value)
    if (!Number.isFinite(num)) return false
    return num < min || num > max
  }

  // Handle part selection
  const handlePartToggle = (part: ProjectorPart) => {
    const newSelectedIds = new Set(selectedPartIds)
    if (newSelectedIds.has(part.part_number)) {
      newSelectedIds.delete(part.part_number)
    } else {
      newSelectedIds.add(part.part_number)
    }
    setSelectedPartIds(newSelectedIds)
  }

  // Save selected parts to form
  const handleSaveSelectedParts = () => {
    const selectedParts: RecommendedPart[] = filteredParts
      .filter((part) => selectedPartIds.has(part.part_number))
      .map((part) => ({
        part_number: part.part_number,
        description: part.description,
      }))
    setValue('recommendedParts', selectedParts, { shouldDirty: true })
    setIsDialogOpen(false)
  }

  const recommendedParts = watch('recommendedParts') || []

  // Helper function to render fields dynamically based on config
  const renderFieldsBySection = (sectionTitle: string) => {
    if (!formConfig || formConfig.length === 0) {
      return null
    }
    
    const sectionFields = formConfig.filter((f) => f.section === sectionTitle)
    if (sectionFields.length === 0) {
      return null
    }

    // Group fields into rows (2 columns on larger screens)
    const rows: typeof sectionFields[] = []
    let currentRow: typeof sectionFields = []
    
    sectionFields.forEach((field, idx) => {
      currentRow.push(field)
      // Create a new row every 2 fields, or if it's a textarea/select that should be full width
      if (currentRow.length >= 2 || field.type === 'textarea' || idx === sectionFields.length - 1) {
        rows.push([...currentRow])
        currentRow = []
      }
    })

    return (
      <>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className={row.length > 1 && row[0]?.type !== 'textarea' ? "grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3" : ""}>
            {row.map((field) => {
              if (!field) return null
              
              // Special handling for fields that need StatusSelectWithNote or other custom components
              const isStatusField = OPTICAL_FIELDS.includes(field.key as any) || 
                                   ELECTRONIC_FIELDS.includes(field.key as any) ||
                                   MECHANICAL_FIELDS.includes(field.key as any) ||
                                   ['serialNumberVerified', 'AirIntakeLadRad', 'coolantLevelColor', 
                                    'securityLampHouseLock', 'lampLocMechanism', 'pumpConnectorHose',
                                    'lightEngineWhite', 'lightEngineRed', 'lightEngineGreen', 
                                    'lightEngineBlue', 'lightEngineBlack'].includes(field.key)
              
              if (isStatusField) {
                // Keep existing StatusSelectWithNote for these fields
                return null // Will be handled by existing code
              }

              // Special handling for dropdowns that load from external data
              if (field.key === 'softwareVersion' && softwareVersions.length > 0) {
                return (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    <select
                      {...register(field.key as keyof RecordWorkForm)}
                      className="w-full border-2 border-black p-2 text-sm bg-white"
                      defaultValue=""
                    >
                      <option value="" disabled>Select software version</option>
                      {softwareVersions.map((version) => (
                        <option key={version} value={version}>{version}</option>
                      ))}
                    </select>
                  </FormField>
                )
              }

              if (field.key === 'lampMakeModel' && lampModels.length > 0) {
                return (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    <select
                      {...register(field.key as keyof RecordWorkForm)}
                      className="w-full border-2 border-black p-2 text-sm bg-white"
                      defaultValue=""
                    >
                      <option value="" disabled>Select lamp model</option>
                      {lampModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </FormField>
                )
              }

              if (field.key === 'contentPlayerModel' && contentPlayers.length > 0) {
                return (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    <select
                      {...register(field.key as keyof RecordWorkForm)}
                      className="w-full border-2 border-black p-2 text-sm bg-white"
                      defaultValue=""
                    >
                      <option value="" disabled>Select content player</option>
                      {contentPlayers.map((player) => (
                        <option key={player} value={player}>{player}</option>
                      ))}
                    </select>
                  </FormField>
                )
              }

              // Special validation for running hours
              if (field.key === 'projectorRunningHours') {
                const runningHours = watch('projectorRunningHours')
                return (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    <DynamicFormField
                      field={field}
                      register={register}
                      className="border-2 border-black text-black text-sm"
                    />
                    {isOutOfRange(runningHours, 1000, 120000) && (
                      <p className="text-xs text-red-600 mt-1">Enter between 1,000 and 120,000.</p>
                    )}
                  </FormField>
                )
              }

              if (field.key === 'lampTotalRunningHours' || field.key === 'lampCurrentRunningHours') {
                const hours = watch(field.key as keyof RecordWorkForm)
                return (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    <DynamicFormField
                      field={field}
                      register={register}
                      className="border-2 border-black text-sm"
                    />
                    {isOutOfRange(hours, 1000, 100000) && (
                      <p className="text-xs text-red-600 mt-1">Enter between 1,000 and 100,000.</p>
                    )}
                  </FormField>
                )
              }

              // Default rendering for other fields
              return (
                <FormField key={field.key} label={field.label} required={field.required}>
                  <DynamicFormField
                    field={field}
                    register={register}
                    className="border-2 border-black text-sm"
                  />
                </FormField>
              )
            })}
          </div>
        ))}
      </>
    )
  }

  const StatusSelectWithNote = ({
    field,
    label,
    options,
    noteOptions,
    noteDefault,
  }: {
    field: keyof RecordWorkForm & string
    label: string
    options?: Array<{ value: string; label: string; description?: string }>
    noteOptions?: string[]
    noteDefault?: string
  }) => {
    const status = (watch(field as keyof RecordWorkForm) as string) || 'OK'
    const noteField = `${field}Note` as keyof RecordWorkForm
    const initialChoice = noteDefault || noteOptions?.[0] || ''
    const [noteChoice, setNoteChoice] = useState<string>(initialChoice)
    const [noteText, setNoteText] = useState<string>('')
    const statusRegister = register(field as keyof RecordWorkForm)

    const selectOptions =
      options && options.length
        ? options
        : [
            { value: 'OK', label: 'OK', description: 'Part is OK' },
            { value: 'YES', label: 'YES', description: 'Needs replacement' },
          ]

    const formatNote = (choice: string, text: string) => {
      const c = choice?.trim()
      const t = text?.trim()
      if (c && t) return `${c} - ${t}`
      if (c) return c
      if (t) return t
      return ''
    }

    const handleReasonChange = (val: string) => {
      setNoteChoice(val)
      if (status === 'YES') {
        setValue(noteField, formatNote(val, noteText), { shouldDirty: true })
      }
    }

    const handleNoteTextChange = (text: string) => {
      setNoteText(text)
      if (status === 'YES') {
        setValue(noteField, formatNote(noteChoice, text), { shouldDirty: true })
      }
    }

    // Clear on status change away from YES
    useEffect(() => {
      if (status !== 'YES') {
        const currentNote = getValues(noteField)
        const shouldResetChoice = noteChoice !== initialChoice
        const shouldClearValue = Boolean(currentNote)

        if (shouldResetChoice) setNoteChoice(initialChoice)
        if (noteText) setNoteText('')
        if (shouldClearValue) setValue(noteField, '', { shouldDirty: true })
      }
    }, [status, initialChoice, noteField, noteChoice, noteText, getValues, setValue])

    // Keep note field in sync when status is YES
    useEffect(() => {
      if (status === 'YES') {
        setValue(noteField, formatNote(noteChoice, noteText), { shouldDirty: true })
      }
    }, [status, noteChoice, noteText, noteField, setValue])

    // Initialize choice on first render if missing
    useEffect(() => {
      if (!noteChoice && initialChoice) {
        setNoteChoice(initialChoice)
      }
    }, [noteChoice, initialChoice])

    return (
      <FormField label={label}>
        <select
          name={statusRegister.name}
          ref={statusRegister.ref}
          onBlur={statusRegister.onBlur}
          value={status}
          onChange={(event) => {
            const value = event.target.value
            setValue(field, value, { shouldDirty: true })
            statusRegister.onChange(event)
            if (value !== 'Not OK') {
              clearIssueNote(field)
            }
          }}
          className="w-full border-2 border-black p-2 text-black text-sm"
        >
          {selectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} {option.description && `(${option.description})`}
            </option>
          ))}
        </select>

        {status === 'YES' && noteOptions?.length ? (
          <>
            <select
              className="w-full border-2 border-black p-2 text-black text-sm mt-2"
              value={noteChoice}
              onChange={(e) => handleReasonChange(e.target.value)}
            >
              <option value="" disabled>
                Select reason
              </option>
              {noteOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <Input
              type="text"
              value={noteText}
              onChange={(e) => handleNoteTextChange(e.target.value)}
              placeholder="Add details"
              className="border-2 border-black text-sm mt-2"
            />
          </>
        ) : null}

        {status === 'YES' && !noteOptions?.length && (
          <Input
            {...register(noteField)}
            defaultValue={noteDefault}
            placeholder="Enter details..."
            className="border-2 border-black text-sm mt-2"
          />
        )}
      </FormField>
    )
  }

  const onSubmit = (values: RecordWorkForm) => {
    if (!hasRequiredImages) {
      setImageError('Please upload at least one broken-part image and one additional reference image.')
      return
    }

    const formattedValues = {
      ...values,
      exhaustCfm: values.exhaustCfm ? `${values.exhaustCfm} M/s` : '',
    }

    onNext({
      workDetails: formattedValues,
      workImages: {
        broken: brokenImages,
        other: referenceImages,
      },
    })
  }

  // Force re-render when config changes
  useEffect(() => {
    // Config change triggers re-render via key prop on form div
  }, [configLoading, formConfig])

  // Don't render form until config is loaded (unless it's taking too long)
  if (configLoading && formConfig.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading form configuration...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Record Work Details</h2>
      <p className="text-sm text-gray-700 mb-4">Document work performed, issues found, and component status.</p>

      <div className="mb-3 flex justify-end">
        <Button
          type="button"
          onClick={handleResetForm}
          variant="outline"
          className="border-2 border-red-600 text-red-600 hover:bg-red-50 text-sm"
        >
          Reset Form
        </Button>
      </div>

      <div className="border-2 border-black p-3 sm:p-4 mb-4 space-y-6" key={`form-${formConfig.length}`}>
        <FormSection title="Cinema Details">
          {renderFieldsBySection("Cinema Details")}
        </FormSection>

        <FormSection title="Projector Information">
          {renderFieldsBySection("Projector Information")}
        </FormSection>

        <FormSection title="Opticals">
          <FormRow>
            {OPTICAL_FIELDS.map((field) => (
              <StatusSelectWithNote
                key={field}
                field={field}
                label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                options={[
                  { value: 'OK', label: 'OK', description: 'Part is OK' },
                  { value: 'YES', label: 'YES', description: 'Needs replacement' },
                ]}
                noteOptions={['Solarized', 'Chipped', 'Cracked', 'Not Present']}
              />
            ))}
          </FormRow>
        </FormSection>

        <FormSection title="Electronics">
          <FormRow>
            {ELECTRONIC_FIELDS.map((field) => (
              <StatusSelectWithNote
                key={field}
                field={field}
                label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                options={[
                  { value: 'OK', label: 'OK', description: 'Part is OK' },
                  { value: 'YES', label: 'YES', description: 'Needs replacement' },
                ]}
              />
            ))}
          </FormRow>
        </FormSection>

        <FormSection title="Serial Number Verified">
          <FormRow>
            <StatusSelectWithNote
              field="serialNumberVerified"
              label="Chassis label vs Touch Panel"
              options={[
                { value: 'OK', label: 'OK', description: 'Part is OK' },
                { value: 'YES', label: 'YES', description: 'Needs replacement' },
              ]}
              noteDefault="Package File Required"
            />
          </FormRow>
        </FormSection>

        <FormSection title="Disposable Consumables">
          <FormRow>
            <StatusSelectWithNote
              field="AirIntakeLadRad"
              label="Air Intake, LAD and RAD"
              options={[
                { value: 'OK', label: 'OK', description: 'Part is OK' },
                { value: 'YES', label: 'YES', description: 'Needs replacement' },
              ]}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Coolant">
          <FormRow>
            <StatusSelectWithNote
              field="coolantLevelColor"
              label="Level and Color"
              options={[
                { value: 'OK', label: 'OK', description: 'Part is OK' },
                { value: 'YES', label: 'YES', description: 'Needs replacement' },
              ]}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Light Engine Test Pattern">
          <FormRow>
            {['lightEngineWhite', 'lightEngineRed', 'lightEngineGreen', 'lightEngineBlue', 'lightEngineBlack'].map(
              (field) => (
                <StatusSelectWithNote
                  key={field}
                  field={field as keyof RecordWorkForm & string}
                  label={field.replace('lightEngine', '').toUpperCase()}
                  options={[
                    { value: 'OK', label: 'OK', description: 'Part is OK' },
                    { value: 'YES', label: 'YES', description: 'Needs replacement' },
                  ]}
                />
              ),
            )}
          </FormRow>
        </FormSection>

        <FormSection title="Mechanical">
          <FormRow>
            {MECHANICAL_FIELDS.map((field) => (
              <StatusSelectWithNote
                key={field}
                field={field}
                label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                options={[
                  { value: 'OK', label: 'OK', description: 'Part is OK' },
                  { value: 'YES', label: 'YES', description: 'Needs replacement' },
                ]}
                noteOptions={
                  field === 'acBlowerVane' || field === 'extractorVane'
                    ? ['Bypassed', 'Switch Faulty']
                    : undefined
                }
              />
            ))}
          </FormRow>
          <FormRow>
            <FormField label="Exhaust CFM (M/s)">
              <Input
                type="number"
                step="0.1"
                {...register('exhaustCfm')}
                placeholder="Enter value"
                className="border-2 border-black text-sm"
              />
            </FormField>
            <StatusSelectWithNote
              field="pumpConnectorHose"
              label="Pump Connector & Hose"
              options={[
                { value: 'OK', label: 'OK', description: 'Part is OK' },
                { value: 'YES', label: 'YES', description: 'Needs replacement' },
              ]}
            />
          </FormRow>
          <FormRow>
            <StatusSelectWithNote
              field="securityLampHouseLock"
              label="Security & Lamp Lock"
              options={[
                { value: 'OK', label: 'OK', description: 'Working' },
                { value: 'YES', label: 'YES', description: 'Not working / needs attention' },
              ]}
              noteOptions={['Bypassed', 'Switch Faulty']}
            />
            <StatusSelectWithNote
              field="lampLocMechanism"
              label="Lamp LOC Mechanism"
              options={[
                { value: 'OK', label: 'OK', description: 'Part is OK' },
                { value: 'YES', label: 'YES', description: 'Needs replacement' },
              ]}
            />
          </FormRow>
          <FormField label="Projector Placement & Environment">
            <textarea
              {...register('projectorPlacementEnvironment')}
              placeholder="Environmental conditions"
              className="w-full border-2 border-black p-2 text-black text-sm"
              rows={2}
            />
          </FormField>
        </FormSection>

        <FormSection title="Software & Screen Information">
          {renderFieldsBySection("Software & Screen Information")}
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">Scope Dimensions</p>
            <FormRow>
              <FormField label="Screen Height (m)">
                <Input type="number" step="0.01" {...register('screenHeight')} placeholder="Height" className="border-2 border-black text-sm" />
              </FormField>
              <FormField label="Screen Width (m)">
                <Input type="number" step="0.01" {...register('screenWidth')} placeholder="Width" className="border-2 border-black text-sm" />
              </FormField>
            </FormRow>
          </div>
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">Flat Dimensions</p>
            <FormRow>
              <FormField label="Flat Height (m)">
                <Input type="number" step="0.01" {...register('flatHeight')} placeholder="Height" className="border-2 border-black text-sm" />
              </FormField>
              <FormField label="Flat Width (m)">
                <Input type="number" step="0.01" {...register('flatWidth')} placeholder="Width" className="border-2 border-black text-sm" />
              </FormField>
            </FormRow>
          </div>
        </FormSection>

        <FormSection title="Lamp Information">
          {renderFieldsBySection("Lamp Information")}
        </FormSection>

        <FormSection title="Voltage Parameters">
          {renderFieldsBySection("Voltage Parameters")}
        </FormSection>

        <FormSection title="fL Measurements">
          {renderFieldsBySection("fL Measurements")}
        </FormSection>

        <FormSection title="Content Player & AC Status">
          {renderFieldsBySection("Content Player & AC Status")}
        </FormSection>

        <FormSection title="Color Accuracy - MCGD">
          {COLOR_ACCURACY.map(({ name, fields }) => (
            <div key={name} className="mb-4">
              <p className="font-semibold text-black text-sm mb-2">{name}</p>
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">2K Values</p>
                <FormRow>
                  <FormField label="X">
                    <Input
                      type="number"
                      step="0.001"
                      {...register(fields[0] as keyof RecordWorkForm)}
                      placeholder="X"
                      className="border-2 border-black text-black text-sm"
                    />
                  </FormField>
                  <FormField label="Y">
                    <Input
                      type="number"
                      step="0.001"
                      {...register(fields[1] as keyof RecordWorkForm)}
                      placeholder="Y"
                      className="border-2 border-black text-black text-sm"
                    />
                  </FormField>
                  <FormField label="fL">
                    <Input
                      type="number"
                      step="0.001"
                      {...register(fields[2] as keyof RecordWorkForm)}
                      placeholder="fL"
                      className="border-2 border-black text-black text-sm"
                    />
                  </FormField>
                </FormRow>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">4K Values</p>
                <FormRow>
                  <FormField label="X">
                    <Input
                      type="number"
                      step="0.001"
                      {...register(fields[3] as keyof RecordWorkForm)}
                      placeholder="X"
                      className="border-2 border-black text-black text-sm"
                    />
                  </FormField>
                  <FormField label="Y">
                    <Input
                      type="number"
                      step="0.001"
                      {...register(fields[4] as keyof RecordWorkForm)}
                      placeholder="Y"
                      className="border-2 border-black text-black text-sm"
                    />
                  </FormField>
                  <FormField label="fL">
                    <Input
                      type="number"
                      step="0.001"
                      {...register(fields[5] as keyof RecordWorkForm)}
                      placeholder="fL"
                      className="border-2 border-black text-black text-sm"
                    />
                  </FormField>
                </FormRow>
              </div>
            </div>
          ))}
        </FormSection>

        <FormSection title="Color Accuracy - CIE XYZ">
          <div className="mb-4">
            <p className="font-semibold text-black text-sm mb-2">BW Step 10</p>
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">2K Values</p>
              <FormRow>
                <FormField label="X">
                  <Input
                    type="number"
                    step="0.001"
                    {...register('BW_Step_10_2Kx')}
                    placeholder="X"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Y">
                  <Input
                    type="number"
                    step="0.001"
                    {...register('BW_Step_10_2Ky')}
                    placeholder="Y"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="fL">
                  <Input
                    type="number"
                    step="0.001"
                    {...register('BW_Step_10_2Kfl')}
                    placeholder="fL"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
              </FormRow>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">4K Values</p>
              <FormRow>
                <FormField label="X">
                  <Input
                    type="number"
                    step="0.001"
                    {...register('BW_Step_10_4Kx')}
                    placeholder="X"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Y">
                  <Input
                    type="number"
                    step="0.001"
                    {...register('BW_Step_10_4Ky')}
                    placeholder="Y"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="fL">
                  <Input
                    type="number"
                    step="0.001"
                    {...register('BW_Step_10_4Kfl')}
                    placeholder="fL"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
              </FormRow>
            </div>
          </div>
        </FormSection>

        <FormSection title="Image Evaluation">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {IMAGE_EVAL_FIELDS.map(({ field, label }) => (
              <FormField key={field} label={label}>
                <select {...register(field as keyof RecordWorkForm)} className="w-full border-2 border-black p-2 text-sm">
                  <option value="">Select</option>
                  <option value="OK">OK</option>
                  <option value="YES">Yes</option>
                </select>
              </FormField>
            ))}
          </div>
          <FormRow>
            <FormField label="Pixel Defects">
              <select {...register('pixelDefects')} className="w-full border-2 border-black p-2 text-sm">
                <option value="">Select</option>
                <option value="OK">OK</option>
                <option value="YES">Yes</option>
              </select>
            </FormField>
            <FormField label="Image Vibration">
              <select {...register('imageVibration')} className="w-full border-2 border-black p-2 text-sm">
                <option value="">Select</option>
                <option value="OK">OK</option>
                <option value="YES">Yes</option>
              </select>
            </FormField>
            <FormField label="LiteLOC Status">
              <select {...register('liteloc')} className="w-full border-2 border-black p-2 text-sm">
                <option value="">Select</option>
                <option value="OK">OK</option>
                <option value="YES">Yes</option>
              </select>
            </FormField>
          </FormRow>
        </FormSection>

        <FormSection title="Air Pollution Data">
          {renderFieldsBySection("Air Pollution Data")}
        </FormSection>


        <FormSection title="Recommended Parts">
          <div className="space-y-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-black text-black hover:bg-gray-100"
                  disabled={!projectorModel}
                >
                  {recommendedParts.length > 0
                    ? `Update Selected Parts (${recommendedParts.length})`
                    : 'Select Recommended Parts'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>
                    Select Recommended Parts
                    {projectorModel && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        for {projectorModel}
                      </span>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {projectorModel
                      ? `Select parts recommended for projector model ${projectorModel}`
                      : 'Please enter a projector model first to view available parts'}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-1">
                  {!projectorModel ? (
                    <p className="text-sm text-gray-600 py-4">
                      Please enter a projector model in the form above to view available parts.
                    </p>
                  ) : filteredParts.length === 0 ? (
                    <p className="text-sm text-gray-600 py-4">
                      No parts found for projector model "{projectorModel}". Please check the model
                      name.
                    </p>
                  ) : (
                    <div className="space-y-3 py-2">
                      {filteredParts.map((part) => {
                        const isSelected = selectedPartIds.has(part.part_number)
                        return (
                          <div
                            key={part.part_number}
                            className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-md hover:border-black transition-colors"
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handlePartToggle(part)}
                              id={part.part_number}
                              className="mt-1"
                            />
                            <Label
                              htmlFor={part.part_number}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              <div className="font-semibold text-black">{part.description}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                Part Number: {part.part_number}
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-2 border-black text-black hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveSelectedParts}
                    disabled={!projectorModel || filteredParts.length === 0}
                    className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                  >
                    Save Selected ({selectedPartIds.size})
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {recommendedParts.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-black">Selected Parts:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-gray-200 p-3 rounded-md">
                  {recommendedParts.map((part: RecommendedPart, index: number) => (
                    <div
                      key={`${part.part_number}-${index}`}
                      className="text-xs sm:text-sm border-b border-gray-200 pb-2 last:border-b-0 last:pb-0"
                    >
                      <div className="font-semibold text-black">{part.description}</div>
                      <div className="text-gray-600">Part Number: {part.part_number}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!projectorModel && (
              <p className="text-xs text-gray-600">
                Please enter a projector model above to select recommended parts.
              </p>
            )}
          </div>
        </FormSection>

        <FormSection title="Remarks">
          {renderFieldsBySection("Remarks")}
        </FormSection>

        <FormSection title="Service Images">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Upload at least one image of the broken component and one supporting/reference image before proceeding.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-sm text-black mb-2">Broken Parts Images *</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload('broken', e.target.files)}
                className="w-full border-2 border-dashed border-black p-4 text-sm bg-gray-50"
              />
              {brokenImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {brokenImages.map((file, index) => (
                    <div key={`broken-${index}`} className="relative border border-gray-200 p-1 group">
                      <img src={file.url} alt={file.name} className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('broken', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        ✕
                      </button>
                      <p className="text-[11px] text-gray-600 truncate mt-1">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm text-black mb-2">Other Evidence Images *</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload('reference', e.target.files)}
                className="w-full border-2 border-dashed border-black p-4 text-sm bg-gray-50"
              />
              {referenceImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {referenceImages.map((file, index) => (
                    <div key={`reference-${index}`} className="relative border border-gray-200 p-1 group">
                      <img src={file.url} alt={file.name} className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('reference', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        ✕
                      </button>
                      <p className="text-[11px] text-gray-600 truncate mt-1">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {imageError && <p className="text-sm text-red-600 mt-2">{imageError}</p>}
          {uploading && <p className="text-xs text-gray-500 mt-2">Uploading images...</p>}
        </FormSection>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="border-2 border-black text-black hover:bg-gray-100 flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={!hasRequiredImages}
          className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Signatures
        </Button>
      </div>
    </form>
  )
}
