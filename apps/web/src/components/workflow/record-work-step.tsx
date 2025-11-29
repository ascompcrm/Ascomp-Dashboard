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
const ELECTRONIC_FIELDS = ['touchPanel', 'evbImcbBoard', 'pibIcpBoard', 'imbSBoard'] as const
const MECHANICAL_FIELDS = ['acBlowerVane', 'extractorVane', 'lightEngineFans', 'cardCageFans', 'radiatorFanPump'] as const
const COLOR_ACCURACY = [
  { name: 'White', fields: ['white2Kx', 'white2Ky', 'white2Kfl', 'white4Kx', 'white4Ky', 'white4Kfl'] },
  { name: 'Red', fields: ['red2Kx', 'red2Ky', 'red2Kfl', 'red4Kx', 'red4Ky', 'red4Kfl'] },
  { name: 'Green', fields: ['green2Kx', 'green2Ky', 'green2Kfl', 'green4Kx', 'green4Ky', 'green4Kfl'] },
  { name: 'Blue', fields: ['blue2Kx', 'blue2Ky', 'blue2Kfl', 'blue4Kx', 'blue4Ky', 'blue4Kfl'] },
] as const
const IMAGE_EVAL_FIELDS = [
  { field: 'focusBoresight', label: 'Focus/Boresight OK' },
  { field: 'integratorPosition', label: 'Integrator Position OK' },
  { field: 'spotsOnScreen', label: 'Spots on Screen OK' },
  { field: 'screenCroppingOk', label: 'Screen Cropping OK' },
  { field: 'convergenceOk', label: 'Convergence OK' },
  { field: 'channelsCheckedOk', label: 'Channels Checked OK' },
] as const

const createInitialFormData = () => ({
  cinemaName: '',
  date: new Date().toISOString().split('T')[0],
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
  evbImcbBoard: 'OK',
  pibIcpBoard: 'OK',
  imbSBoard: 'OK',
  reflectorNote: '',
  uvFilterNote: '',
  integratorRodNote: '',
  coldMirrorNote: '',
  foldMirrorNote: '',
  touchPanelNote: '',
  evbImcbBoardNote: '',
  pibIcpBoardNote: '',
  imbSBoardNote: '',
  coolantLevelColor: '',
  lightEngineWhite: '',
  lightEngineRed: '',
  lightEngineGreen: '',
  lightEngineBlue: '',
  lightEngineBlack: '',
  acBlowerVane: 'OK',
  extractorVane: 'OK',
  exhaustCfm: '',
  lightEngineFans: 'OK',
  cardCageFans: 'OK',
  radiatorFanPump: 'OK',
  pumpConnectorHose: 'OK',
  securityLampHouseLock: '',
  lampLocMechanism: 'OK',
  acBlowerVaneNote: '',
  extractorVaneNote: '',
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
  const brokenImagesRef = useRef<UploadedImage[]>([])
  const referenceImagesRef = useRef<UploadedImage[]>([])

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

  useEffect(() => {
    const initial = createInitialFormData()
    if (data?.workDetails) {
      reset({
        ...initial,
        ...data.workDetails,
        issueNotes: data.workDetails.issueNotes || {},
        recommendedParts: data.workDetails.recommendedParts || [],
      })
    } else if (typeof window !== 'undefined') {
      const savedFormData = localStorage.getItem('recordWorkFormData')
      if (savedFormData) {
        const parsed = JSON.parse(savedFormData)
        reset({
          ...initial,
          ...parsed,
          issueNotes: parsed.issueNotes || {},
          recommendedParts: parsed.recommendedParts || [],
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
    } else if (typeof window !== 'undefined') {
      const savedImages = localStorage.getItem('recordWorkImages')
      if (savedImages) {
        const parsed = JSON.parse(savedImages)
        setBrokenImages(parsed.broken || [])
        setReferenceImages(parsed.other || [])
      }
    }
  }, [data, reset])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const subscription = watch((value) => {
      localStorage.setItem('recordWorkFormData', JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [watch])

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
    if (typeof window !== 'undefined') {
      localStorage.setItem('recordWorkImages', JSON.stringify({ broken, other }))
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

  const handleResetForm = () => {
    if (typeof window !== 'undefined' && !window.confirm('Reset all saved data?')) {
      return
    }
    reset(createInitialFormData())
    persistImages([], [])
    setImageError(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recordWorkFormData')
      localStorage.removeItem('recordWorkImages')
    }
  }

  const clearIssueNote = (field: string) => {
    const currentNotes = getValues('issueNotes') || {}
    if (currentNotes[field]) {
      const { [field]: _removed, ...rest } = currentNotes
      setValue('issueNotes', rest as IssueNotes, { shouldDirty: true })
    }
  }

  const wrapStatusChange = (
    name: keyof RecordWorkForm & string
  ) => {
    const statusRegister = register(name as keyof RecordWorkForm)
    return {
      ...statusRegister,
      onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
        statusRegister.onChange(event)
        if (event.target.value !== 'Not OK') {
          clearIssueNote(name)
        }
      },
    }
  }

  const hasRequiredImages = brokenImages.length > 0 && referenceImages.length > 0

  // Filter parts by projector model
  const projectorModel = watch('projectorModel')
  const filteredParts = partsData.filter(
    (part) => part.projector_model.toLowerCase() === projectorModel?.toLowerCase()
  )

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

  const StatusSelectWithNote = ({
    field,
    label,
    options,
  }: {
    field: keyof RecordWorkForm & string
    label: string
    options: Array<{ value: string; label: string; description?: string }>
  }) => {
    const status = watch(field as keyof RecordWorkForm) || 'OK'
    const noteField = `${field}Note` as keyof RecordWorkForm
    
    return (
      <FormField label={label}>
        <select 
          {...wrapStatusChange(field)} 
          className="w-full border-2 border-black p-2 text-black text-sm"
          defaultValue="OK"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} {option.description && `(${option.description})`}
            </option>
          ))}
        </select>
        {status === 'YES' && (
          <Input
            {...register(noteField)}
            placeholder="Enter replacement details..."
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

    onNext({
      workDetails: values,
      workImages: {
        broken: brokenImages,
        other: referenceImages,
      },
    })
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

      <div className="border-2 border-black p-3 sm:p-4 mb-4 space-y-6">
        <FormSection title="Cinema Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <FormField label="Cinema Name" required>
              <Input
                {...register('cinemaName')}
                placeholder="Cinema name"
                className="border-2 border-black text-black text-sm"
              />
            </FormField>
            <FormField label="Date" required>
              <Input
                type="date"
                {...register('date')}
                className="border-2 border-black text-black text-sm"
              />
            </FormField>
          </div>
          <FormField label="Address" required>
            <textarea
              {...register('address')}
              placeholder="Full address"
              className="w-full border-2 border-black p-2 text-black text-sm"
              rows={2}
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <FormField label="Contact Details">
              <Input {...register('contactDetails')} placeholder="Phone/Email" className="border-2 border-black text-sm" />
            </FormField>
            <FormField label="Location">
              <Input {...register('location')} placeholder="Location" className="border-2 border-black text-sm" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <FormField label="Screen No">
              <Input type="number" {...register('screenNumber')} placeholder="Screen number" className="border-2 border-black text-sm" />
            </FormField>
            <FormField label="Service Visit Type">
              <Input type="number" {...register('serviceVisitType')} placeholder="Service visit type" className="border-2 border-black text-sm" />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Projector Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <FormField label="Projector Model" required>
              <Input
                {...register('projectorModel')}
                placeholder="e.g., CP2220"
                className="border-2 border-black text-black text-sm"
              />
            </FormField>
            <FormField label="Serial Number" required>
              <Input
                {...register('projectorSerialNumber')}
                placeholder="Serial number"
                className="border-2 border-black text-black text-sm"
              />
            </FormField>
          </div>
          <FormField label="Running Hours" required>
            <Input
              type="number"
              {...register('projectorRunningHours')}
              placeholder="Hours"
              className="border-2 border-black text-black text-sm"
            />
          </FormField>
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
                  { value: 'NO', label: 'NO', description: 'Not available' },
                ]}
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
                  { value: 'NO', label: 'NO', description: 'Not available' },
                ]}
              />
            ))}
          </FormRow>
          <FormRow>
            <FormField label="Coolant Level & Color">
              <select {...register('coolantLevelColor')} className="w-full border-2 border-black p-2 text-sm">
                <option value="">Select</option>
                <option value="OK">OK</option>
                <option value="Low">Low</option>
                <option value="Discolored">Discolored</option>
                <option value="Leakage">Leakage</option>
              </select>
            </FormField>
          </FormRow>
        </FormSection>

        <FormSection title="Light Engine Test Pattern">
          <FormRow>
            {['lightEngineWhite', 'lightEngineRed', 'lightEngineGreen', 'lightEngineBlue', 'lightEngineBlack'].map((field) => (
              <FormField key={field} label={field.replace('lightEngine', '').toUpperCase()}>
                <select {...register(field as keyof RecordWorkForm)} className="w-full border-2 border-black p-2 text-sm">
                  <option value="">Select</option>
                  <option value="OK">OK</option>
                  <option value="Bad">Bad</option>
                </select>
              </FormField>
            ))}
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
                  { value: 'NO', label: 'NO', description: 'Not available' },
                ]}
              />
            ))}
          </FormRow>
          <FormRow>
            <FormField label="Exhaust CFM">
              <Input
                type="number"
                {...register('exhaustCfm')}
                placeholder="CFM value"
                className="border-2 border-black text-black text-sm"
              />
            </FormField>
            <StatusSelectWithNote
              field="pumpConnectorHose"
              label="Pump Connector & Hose"
              options={[
                { value: 'OK', label: 'OK', description: 'Part is OK' },
                { value: 'YES', label: 'YES', description: 'Needs replacement' },
                { value: 'NO', label: 'NO', description: 'Not available' },
              ]}
            />
          </FormRow>
          <FormRow>
            <FormField label="Security & Lamp Lock">
              <select {...register('securityLampHouseLock')} className="w-full border-2 border-black p-2 text-sm">
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
              </select>
            </FormField>
            <StatusSelectWithNote
              field="lampLocMechanism"
              label="Lamp LOC Mechanism"
              options={[
                { value: 'OK', label: 'OK', description: 'Part is OK' },
                { value: 'YES', label: 'YES', description: 'Needs replacement' },
                { value: 'NO', label: 'NO', description: 'Not available' },
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
          <FormField label="Software Version">
            <Input {...register('softwareVersion')} placeholder="Version" className="border-2 border-black text-sm" />
          </FormField>
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
          <FormRow>
            <FormField label="Screen Gain">
              <Input type="number" step="0.1" {...register('screenGain')} placeholder="Gain" className="border-2 border-black text-sm" />
            </FormField>
            <FormField label="Throw Distance (m)">
              <Input type="number" step="0.1" {...register('throwDistance')} placeholder="Distance" className="border-2 border-black text-sm" />
            </FormField>
          </FormRow>
        </FormSection>

        <FormSection title="Lamp Information">
          <FormField label="Lamp Make & Model">
            <Input {...register('lampMakeModel')} placeholder="Make and model" className="border-2 border-black text-sm" />
          </FormField>
          <FormRow>
            <FormField label="Total Running Hours">
              <Input type="number" {...register('lampTotalRunningHours')} placeholder="Hours" className="border-2 border-black text-sm" />
            </FormField>
            <FormField label="Current Running Hours">
              <Input type="number" {...register('lampCurrentRunningHours')} placeholder="Current hours" className="border-2 border-black text-sm" />
            </FormField>
          </FormRow>
        </FormSection>

        <FormSection title="Voltage Parameters">
          <FormRow>
            <FormField label="P vs N">
              <Input type="number" {...register('pvVsN')} placeholder="Voltage" className="border-2 border-black text-sm" />
            </FormField>
            <FormField label="P vs E">
              <Input type="number" {...register('pvVsE')} placeholder="Voltage" className="border-2 border-black text-sm" />
            </FormField>
            <FormField label="N vs E">
              <Input type="number" {...register('nvVsE')} placeholder="Voltage" className="border-2 border-black text-sm" />
            </FormField>
          </FormRow>
        </FormSection>

        <FormSection title="fL Measurements">
          <FormRow>
            <FormField label="Left">
              <Input type="number" {...register('flLeft')} placeholder="Left fL" className="border-2 border-black text-sm" />
            </FormField>
            <FormField label="Right">
              <Input type="number" {...register('flRight')} placeholder="Right fL" className="border-2 border-black text-sm" />
            </FormField>
          </FormRow>
        </FormSection>

        <FormSection title="Content Player & AC Status">
          <FormField label="Content Player Model">
            <Input {...register('contentPlayerModel')} placeholder="Model" className="border-2 border-black text-sm" />
          </FormField>
          <FormRow>
            <FormField label="AC Status">
              <select {...register('acStatus')} className="w-full border-2 border-black p-2 text-sm">
                <option value="">Select</option>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
                <option value="Not Available">Not Available</option>
              </select>
            </FormField>
            <FormField label="LE Status">
              <select {...register('leStatus')} className="w-full border-2 border-black p-2 text-sm">
                <option value="">Select</option>
                <option value="Removed">Removed</option>
                <option value="Not removed – Good fL">Not removed – Good fL</option>
                <option value="Not removed – De-bonded">Not removed – De-bonded</option>
              </select>
            </FormField>
          </FormRow>
        </FormSection>

        <FormSection title="Color Accuracy - CIE XYZ">
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

        <FormSection title="Image Evaluation">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {IMAGE_EVAL_FIELDS.map(({ field, label }) => (
              <FormField key={field} label={label}>
                <select {...register(field as keyof RecordWorkForm)} className="w-full border-2 border-black p-2 text-sm">
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </FormField>
            ))}
          </div>
          <FormRow>
            <FormField label="Pixel Defects">
              <select {...register('pixelDefects')} className="w-full border-2 border-black p-2 text-sm">
              <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
              </select>
            </FormField>
            <FormField label="Image Vibration">
              <select {...register('imageVibration')} className="w-full border-2 border-black p-2 text-sm">
              <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
              </select>
            </FormField>
            <FormField label="LiteLOC Status">
              <select {...register('liteloc')} className="w-full border-2 border-black p-2 text-sm">
              <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
              </select>
            </FormField>
          </FormRow>
        </FormSection>

        <FormSection title="Air Pollution Data">
          <FormRow>
            {['hcho', 'tvoc', 'pm1', 'pm2_5', 'pm10'].map((field) => (
              <FormField key={field} label={field.toUpperCase()}>
                <Input type="number" {...register(field as keyof RecordWorkForm)} className="border-2 border-black text-sm" />
              </FormField>
            ))}
            <FormField label="Temperature (°C)">
              <Input type="number" step="0.1" {...register('temperature')} className="border-2 border-black text-sm" />
            </FormField>
            <FormField label="Humidity (%)">
              <Input type="number" step="0.1" {...register('humidity')} className="border-2 border-black text-sm" />
            </FormField>
            <FormField label="Air Pollution Level">
              <Input {...register('airPollutionLevel')} placeholder="Level" className="border-2 border-black text-sm" />
            </FormField>
          </FormRow>
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
          <FormField label="Remarks">
            <textarea
              {...register('remarks')}
              placeholder="Additional remarks"
              className="w-full border-2 border-black p-2 text-black text-sm"
              rows={3}
            />
          </FormField>
          <FormField label="Light Engine Serial Number">
            <Input
              {...register('lightEngineSerialNumber')}
              placeholder="LE Serial No."
              className="border-2 border-black text-black text-sm"
            />
          </FormField>
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
                    <div key={`broken-${index}`} className="border border-gray-200 p-1">
                      <img src={file.url} alt={file.name} className="w-full h-24 object-cover" />
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
                    <div key={`reference-${index}`} className="border border-gray-200 p-1">
                      <img src={file.url} alt={file.name} className="w-full h-24 object-cover" />
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
