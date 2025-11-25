import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const createInitialFormData = () => ({
    // Cinema Details
    cinemaName: '',
    date: new Date().toISOString().split('T')[0],
    address: '',
    contactDetails: '',
    location: '',
    screenNumber: '',
    serviceVisitType: '',

    // Projector Information
    projectorModel: '',
    projectorSerialNumber: '',
    projectorRunningHours: '',
    replacementRequired: false,

    // Opticals
    reflector: '',
    uvFilter: '',
    integratorRod: '',
    coldMirror: '',
    foldMirror: '',

    // Electronics
    touchPanel: '',
    evbImcbBoard: '',
    pibIcpBoard: '',
    imbSBoard: '',
    serialNumberVerified: false,
    disposableConsumables: '',
    coolantLevelColor: '',

    // Light Engine Test
    lightEngineWhite: '',
    lightEngineRed: '',
    lightEngineGreen: '',
    lightEngineBlue: '',
    lightEngineBlack: '',

    // Mechanical
    acBlowerVane: '',
    extractorVane: '',
    exhaustCfm: '',
    lightEngineFans: '',
    cardCageFans: '',
    radiatorFanPump: '',
    pumpConnectorHose: '',
    securityLampHouseLock: '',
    lampLocMechanism: '',
    projectorPlacementEnvironment: '',

    // Software and Screen
    softwareVersion: '',
    screenHeight: '',
    screenWidth: '',
    screenGain: '',
    screenMake: '',
    throwDistance: '',

    // Lamp Info
    lampMakeModel: '',
    lampTotalRunningHours: '',
    lampCurrentRunningHours: '',

    // Voltage
    pvVsN: '',
    pvVsE: '',
    nvVsE: '',

    // FL Measurements
    flCenter: '',
    flLeft: '',
    flRight: '',

    // Content Player
    contentPlayerModel: '',
    acStatus: '',
    leStatus: '',

    // Remarks
    remarks: '',
    lightEngineSerialNumber: '',

    // Color Accuracy
    whiteX: '', whiteY: '', whiteFl: '',
    redX: '', redY: '', redFl: '',
    greenX: '', greenY: '', greenFl: '',
    blueX: '', blueY: '', blueFl: '',

    // Image Evaluation
    focusBoresight: false,
    integratorPosition: false,
    spotsOnScreen: false,
    screenCroppingOk: false,
    convergenceOk: false,
    channelsCheckedOk: false,
    pixelDefects: '',
    imageVibration: '',
    liteloc: '',

    // Air Pollution
    hcho: '',
    tvoc: '',
    pm1: '',
    pm2_5: '',
    pm10: '',
    temperature: '',
    humidity: '',
    startTime: '',
    endTime: '',
    signatures: '',
    reportGenerated: false,
    reportUrl: '',
  })

export default function RecordWorkStep({ data, onNext, onBack }: any) {
  const [formData, setFormData] = useState(createInitialFormData())
  const [imageFiles, setImageFiles] = useState<File[]>([])

  useEffect(() => {
    if (data.workDetails) {
      setFormData(data.workDetails)
      return
    }
    const savedFormData = localStorage.getItem('recordWorkFormData')
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData))
    }
  }, [data])

  useEffect(() => {
    if (data.workImages) {
      setImageFiles(data.workImages)
    }
  }, [data.workImages])

  const handleChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    localStorage.setItem('recordWorkFormData', JSON.stringify(newFormData))
  }

  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset the form? This cannot be undone.')) {
      const initialFormData = createInitialFormData()
      setFormData(initialFormData)
      localStorage.setItem('recordWorkFormData', JSON.stringify(initialFormData))
      setImageFiles([])
    }
  }

  const handleNext = () => {
    onNext({ workDetails: formData, workImages: imageFiles })
    localStorage.setItem('recordWorkFormData', JSON.stringify(formData))
  }

  const FormSection = ({ title, children }: any) => (
    <div className="mb-4 pb-4 border-b-2 border-black last:border-b-0">
      <h3 className="font-bold text-black mb-3 text-sm sm:text-base">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )

  const FormRow = ({ children }: any) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">{children}</div>
  )

  const FormField = ({ label, required, children }: any) => (
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
        {label} {required && '*'}
      </label>
      {children}
    </div>
  )

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Record Work Details</h2>
      <p className="text-sm text-gray-700 mb-4">
        Document work performed, issues found, and component status.
      </p>

      <div className="mb-3 flex justify-end">
        <Button
          onClick={handleResetForm}
          variant="outline"
          className="border-2 border-red-600 text-red-600 hover:bg-red-50 text-sm"
        >
          Reset Form
        </Button>
      </div>

      <div className="border-2 border-black p-3 sm:p-4 mb-4 space-y-6">
            {/* Cinema Details */}
            <FormSection title="Cinema Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    Cinema Name *
                  </label>
                  <Input
                    value={formData.cinemaName}
                    onChange={(e) => handleChange('cinemaName', e.target.value)}
                    placeholder="Cinema name"
                    className="border-2 border-black text-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="border-2 border-black text-black text-sm"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Full address"
                  className="w-full border-2 border-black p-2 text-black text-sm"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    Contact Details
                  </label>
                  <Input
                    value={formData.contactDetails}
                    onChange={(e) => handleChange('contactDetails', e.target.value)}
                    placeholder="Phone/Email"
                    className="border-2 border-black text-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    Location
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Location"
                    className="border-2 border-black text-black text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    Screen No
                  </label>
                  <Input
                    type="number"
                    value={formData.screenNumber}
                    onChange={(e) => handleChange('screenNumber', e.target.value)}
                    placeholder="Screen number"
                    className="border-2 border-black text-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    Service Visit Type
                  </label>
                  <select
                    value={formData.serviceVisitType}
                    onChange={(e) => handleChange('serviceVisitType', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select type</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Breakdown">Breakdown</option>
                    <option value="Installation">Installation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </FormSection>

            {/* Projector Information */}
            <FormSection title="Projector Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    Projector Model *
                  </label>
                  <Input
                    value={formData.projectorModel}
                    onChange={(e) => handleChange('projectorModel', e.target.value)}
                    placeholder="e.g., CP2220"
                    className="border-2 border-black text-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    Serial Number *
                  </label>
                  <Input
                    value={formData.projectorSerialNumber}
                    onChange={(e) => handleChange('projectorSerialNumber', e.target.value)}
                    placeholder="Serial number"
                    className="border-2 border-black text-black text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-1">
                    Running Hours *
                  </label>
                  <Input
                    type="number"
                    value={formData.projectorRunningHours}
                    onChange={(e) => handleChange('projectorRunningHours', e.target.value)}
                    placeholder="Hours"
                    className="border-2 border-black text-black text-sm"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.replacementRequired}
                      onChange={(e) => handleChange('replacementRequired', e.target.checked)}
                      className="w-4 h-4 border-2 border-black"
                    />
                    <span className="font-semibold text-black text-sm">Replacement Required</span>
                  </label>
                </div>
              </div>
            </FormSection>

            {/* Opticals */}
            <FormSection title="Opticals">
              <FormRow>
                {['reflector', 'uvFilter', 'integratorRod', 'coldMirror', 'foldMirror'].map((field) => (
                  <FormField key={field} label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}>
                    <select
                      value={String(formData[field as keyof typeof formData] ?? '')}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full border-2 border-black p-2 text-black text-sm"
                    >
                      <option value="">Select</option>
                      <option value="OK">OK</option>
                      <option value="Not OK">Not OK</option>
                      <option value="Needs Replacement">Needs Replacement</option>
                    </select>
                  </FormField>
                ))}
              </FormRow>
            </FormSection>

            {/* Electronics */}
            <FormSection title="Electronics">
              <FormRow>
                {['touchPanel', 'evbImcbBoard', 'pibIcpBoard', 'imbSBoard'].map((field) => (
                  <FormField key={field} label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}>
                    <select
                      value={String(formData[field as keyof typeof formData] ?? '')}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full border-2 border-black p-2 text-black text-sm"
                    >
                      <option value="">Select</option>
                      <option value="OK">OK</option>
                      <option value="Not OK">Not OK</option>
                    </select>
                  </FormField>
                ))}
              </FormRow>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.serialNumberVerified}
                  onChange={(e) => handleChange('serialNumberVerified', e.target.checked)}
                  className="w-4 h-4 border-2 border-black"
                />
                <span className="font-semibold text-black text-sm">Serial Number Verified</span>
              </div>
              <FormRow>
                <FormField label="Disposable Consumables">
                  <select
                    value={formData.disposableConsumables}
                    onChange={(e) => handleChange('disposableConsumables', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Cleaned">Cleaned</option>
                    <option value="Replaced">Replaced</option>
                    <option value="OK">OK</option>
                    <option value="Not OK">Not OK</option>
                  </select>
                </FormField>
                <FormField label="Coolant Level & Color">
                  <select
                    value={formData.coolantLevelColor}
                    onChange={(e) => handleChange('coolantLevelColor', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select</option>
                    <option value="OK">OK</option>
                    <option value="Low">Low</option>
                    <option value="Discolored">Discolored</option>
                    <option value="Leakage">Leakage</option>
                  </select>
                </FormField>
              </FormRow>
            </FormSection>

            {/* Light Engine Test Pattern */}
            <FormSection title="Light Engine Test Pattern">
              <FormRow>
                {['lightEngineWhite', 'lightEngineRed', 'lightEngineGreen', 'lightEngineBlue', 'lightEngineBlack'].map((field) => (
                  <FormField key={field} label={field.replace('lightEngine', '').toUpperCase()}>
                    <select
                      value={String(formData[field as keyof typeof formData] ?? '')}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full border-2 border-black p-2 text-black text-sm"
                    >
                      <option value="">Select</option>
                      <option value="OK">OK</option>
                      <option value="Bad">Bad</option>
                    </select>
                  </FormField>
                ))}
              </FormRow>
            </FormSection>

            {/* Mechanical */}
            <FormSection title="Mechanical">
              <FormRow>
                {['acBlowerVane', 'extractorVane', 'lightEngineFans', 'cardCageFans', 'radiatorFanPump'].map((field) => (
                  <FormField key={field} label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}>
                    <select
                      value={String(formData[field as keyof typeof formData] ?? '')}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full border-2 border-black p-2 text-black text-sm"
                    >
                      <option value="">Select</option>
                      <option value="OK">OK</option>
                      <option value="Not OK">Not OK</option>
                    </select>
                  </FormField>
                ))}
              </FormRow>
              <FormRow>
                <FormField label="Exhaust CFM">
                  <Input
                    type="number"
                    value={formData.exhaustCfm}
                    onChange={(e) => handleChange('exhaustCfm', e.target.value)}
                    placeholder="CFM value"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Pump Connector & Hose">
                  <select
                    value={formData.pumpConnectorHose}
                    onChange={(e) => handleChange('pumpConnectorHose', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select</option>
                    <option value="OK">OK</option>
                    <option value="Not OK">Not OK</option>
                  </select>
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="Security & Lamp Lock">
                  <select
                    value={formData.securityLampHouseLock}
                    onChange={(e) => handleChange('securityLampHouseLock', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Working">Working</option>
                    <option value="Not Working">Not Working</option>
                  </select>
                </FormField>
                <FormField label="Lamp LOC Mechanism">
                  <select
                    value={formData.lampLocMechanism}
                    onChange={(e) => handleChange('lampLocMechanism', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select</option>
                    <option value="OK">OK</option>
                    <option value="Not OK">Not OK</option>
                  </select>
                </FormField>
              </FormRow>
              <FormField label="Projector Placement & Environment">
                <textarea
                  value={formData.projectorPlacementEnvironment}
                  onChange={(e) => handleChange('projectorPlacementEnvironment', e.target.value)}
                  placeholder="Environmental conditions"
                  className="w-full border-2 border-black p-2 text-black text-sm"
                  rows={2}
                />
              </FormField>
            </FormSection>

            {/* Software & Screen */}
            <FormSection title="Software & Screen Information">
              <FormField label="Software Version">
                <Input
                  value={formData.softwareVersion}
                  onChange={(e) => handleChange('softwareVersion', e.target.value)}
                  placeholder="Version"
                  className="border-2 border-black text-black text-sm"
                />
              </FormField>
              <FormRow>
                <FormField label="Screen Height (m)">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.screenHeight}
                    onChange={(e) => handleChange('screenHeight', e.target.value)}
                    placeholder="Height"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Screen Width (m)">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.screenWidth}
                    onChange={(e) => handleChange('screenWidth', e.target.value)}
                    placeholder="Width"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Screen Gain">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.screenGain}
                    onChange={(e) => handleChange('screenGain', e.target.value)}
                    placeholder="Gain"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Screen Make">
                  <Input
                    value={formData.screenMake}
                    onChange={(e) => handleChange('screenMake', e.target.value)}
                    placeholder="Make"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Throw Distance (m)">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.throwDistance}
                    onChange={(e) => handleChange('throwDistance', e.target.value)}
                    placeholder="Distance"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
              </FormRow>
            </FormSection>

            {/* Lamp Information */}
            <FormSection title="Lamp Information">
              <FormField label="Lamp Make & Model">
                <Input
                  value={formData.lampMakeModel}
                  onChange={(e) => handleChange('lampMakeModel', e.target.value)}
                  placeholder="Make and model"
                  className="border-2 border-black text-black text-sm"
                />
              </FormField>
              <FormRow>
                <FormField label="Total Running Hours">
                  <Input
                    type="number"
                    value={formData.lampTotalRunningHours}
                    onChange={(e) => handleChange('lampTotalRunningHours', e.target.value)}
                    placeholder="Hours"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Current Running Hours">
                  <Input
                    type="number"
                    value={formData.lampCurrentRunningHours}
                    onChange={(e) => handleChange('lampCurrentRunningHours', e.target.value)}
                    placeholder="Current hours"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
              </FormRow>
            </FormSection>

            {/* Voltage Parameters */}
            <FormSection title="Voltage Parameters">
              <FormRow>
                <FormField label="P vs N">
                  <Input
                    type="number"
                    value={formData.pvVsN}
                    onChange={(e) => handleChange('pvVsN', e.target.value)}
                    placeholder="Voltage"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="P vs E">
                  <Input
                    type="number"
                    value={formData.pvVsE}
                    onChange={(e) => handleChange('pvVsE', e.target.value)}
                    placeholder="Voltage"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="N vs E">
                  <Input
                    type="number"
                    value={formData.nvVsE}
                    onChange={(e) => handleChange('nvVsE', e.target.value)}
                    placeholder="Voltage"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
              </FormRow>
            </FormSection>

            {/* FL Measurements */}
            <FormSection title="fL Measurements">
              <FormRow>
                <FormField label="Center">
                  <Input
                    type="number"
                    value={formData.flCenter}
                    onChange={(e) => handleChange('flCenter', e.target.value)}
                    placeholder="Center fL"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Left">
                  <Input
                    type="number"
                    value={formData.flLeft}
                    onChange={(e) => handleChange('flLeft', e.target.value)}
                    placeholder="Left fL"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Right">
                  <Input
                    type="number"
                    value={formData.flRight}
                    onChange={(e) => handleChange('flRight', e.target.value)}
                    placeholder="Right fL"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
              </FormRow>
            </FormSection>

            {/* Content Player */}
            <FormSection title="Content Player & AC Status">
              <FormField label="Content Player Model">
                <Input
                  value={formData.contentPlayerModel}
                  onChange={(e) => handleChange('contentPlayerModel', e.target.value)}
                  placeholder="Model"
                  className="border-2 border-black text-black text-sm"
                />
              </FormField>
              <FormRow>
                <FormField label="AC Status">
                  <select
                    value={formData.acStatus}
                    onChange={(e) => handleChange('acStatus', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Working">Working</option>
                    <option value="Not Working">Not Working</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </FormField>
                <FormField label="LE Status">
                  <select
                    value={formData.leStatus}
                    onChange={(e) => handleChange('leStatus', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Removed">Removed</option>
                    <option value="Not removed – Good fL">Not removed – Good fL</option>
                    <option value="Not removed – De-bonded">Not removed – De-bonded</option>
                  </select>
                </FormField>
              </FormRow>
            </FormSection>

            {/* Color Accuracy */}
            <FormSection title="Color Accuracy - CIE XYZ">
              {[
                { name: 'White', fields: ['whiteX', 'whiteY', 'whiteFl'] },
                { name: 'Red', fields: ['redX', 'redY', 'redFl'] },
                { name: 'Green', fields: ['greenX', 'greenY', 'greenFl'] },
                { name: 'Blue', fields: ['blueX', 'blueY', 'blueFl'] },
              ].map(({ name, fields }) => (
                <div key={name} className="mb-3">
                  <p className="font-semibold text-black text-sm mb-2">{name}</p>
                  <FormRow>
                    {fields.map((field) => (
                      <FormField key={field} label={field.replace(name.toLowerCase(), '').toUpperCase()}>
                        <Input
                          type="number"
                          step="0.001"
                          value={String(formData[field as keyof typeof formData] ?? '')}
                          onChange={(e) => handleChange(field, e.target.value)}
                          placeholder={field.replace(name.toLowerCase(), '')}
                          className="border-2 border-black text-black text-sm"
                        />
                      </FormField>
                    ))}
                  </FormRow>
                </div>
              ))}
            </FormSection>

            {/* Image Evaluation */}
            <FormSection title="Image Evaluation">
              <div className="space-y-2">
                {[
                  { field: 'focusBoresight', label: 'Focus/Boresight OK' },
                  { field: 'integratorPosition', label: 'Integrator Position OK' },
                  { field: 'spotsOnScreen', label: 'Spots on Screen OK' },
                  { field: 'screenCroppingOk', label: 'Screen Cropping OK' },
                  { field: 'convergenceOk', label: 'Convergence OK' },
                  { field: 'channelsCheckedOk', label: 'Channels Checked OK' },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[field as keyof typeof formData] as boolean}
                      onChange={(e) => handleChange(field, e.target.checked)}
                      className="w-4 h-4 border-2 border-black"
                    />
                    <span className="text-black text-sm">{label}</span>
                  </label>
                ))}
              </div>
              <FormRow>
                <FormField label="Pixel Defects">
                  <select
                    value={formData.pixelDefects}
                    onChange={(e) => handleChange('pixelDefects', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select</option>
                    <option value="None">None</option>
                    <option value="Few">Few</option>
                    <option value="Many">Many</option>
                  </select>
                </FormField>
                <FormField label="Image Vibration">
                  <select
                    value={formData.imageVibration}
                    onChange={(e) => handleChange('imageVibration', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select</option>
                    <option value="None">None</option>
                    <option value="Slight">Slight</option>
                    <option value="Severe">Severe</option>
                  </select>
                </FormField>
                <FormField label="LiteLOC Status">
                  <select
                    value={formData.liteloc}
                    onChange={(e) => handleChange('liteloc', e.target.value)}
                    className="w-full border-2 border-black p-2 text-black text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Working">Working</option>
                    <option value="Not Working">Not Working</option>
                  </select>
                </FormField>
              </FormRow>
            </FormSection>

            {/* Air Pollution */}
            <FormSection title="Air Pollution Data">
              <FormRow>
                <FormField label="HCHO">
                  <Input
                    type="number"
                    value={formData.hcho}
                    onChange={(e) => handleChange('hcho', e.target.value)}
                    placeholder="HCHO"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="TVOC">
                  <Input
                    type="number"
                    value={formData.tvoc}
                    onChange={(e) => handleChange('tvoc', e.target.value)}
                    placeholder="TVOC"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="PM1.0">
                  <Input
                    type="number"
                    value={formData.pm1}
                    onChange={(e) => handleChange('pm1', e.target.value)}
                    placeholder="PM1.0"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="PM2.5">
                  <Input
                    type="number"
                    value={formData.pm2_5}
                    onChange={(e) => handleChange('pm2_5', e.target.value)}
                    placeholder="PM2.5"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="PM10">
                  <Input
                    type="number"
                    value={formData.pm10}
                    onChange={(e) => handleChange('pm10', e.target.value)}
                    placeholder="PM10"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Temperature (°C)">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                    placeholder="Temperature"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="Humidity (%)">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.humidity}
                    onChange={(e) => handleChange('humidity', e.target.value)}
                    placeholder="Humidity"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
              </FormRow>
            </FormSection>

            {/* Service Timing & Report */}
            <FormSection title="Service Timing & Report">
              <FormRow>
                <FormField label="Start Time">
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
                <FormField label="End Time">
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="Report Generated">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reportGenerated}
                      onChange={(e) => handleChange('reportGenerated', e.target.checked)}
                      className="w-4 h-4 border-2 border-black"
                    />
                    <span className="text-black text-sm">Yes</span>
                  </label>
                </FormField>
                <FormField label="Report URL">
                  <Input
                    value={formData.reportUrl}
                    onChange={(e) => handleChange('reportUrl', e.target.value)}
                    placeholder="https://"
                    className="border-2 border-black text-black text-sm"
                  />
                </FormField>
              </FormRow>
              <FormField label="Signatures / Notes">
                <textarea
                  value={formData.signatures}
                  onChange={(e) => handleChange('signatures', e.target.value)}
                  placeholder="Capture signature metadata or notes"
                  className="w-full border-2 border-black p-2 text-black text-sm"
                  rows={3}
                />
              </FormField>
            </FormSection>

            {/* Remarks */}
            <FormSection title="Remarks">
              <FormField label="Remarks">
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  placeholder="Additional remarks"
                  className="w-full border-2 border-black p-2 text-black text-sm"
                  rows={3}
                />
              </FormField>
              <FormField label="Light Engine Serial Number">
                <Input
                  value={formData.lightEngineSerialNumber}
                  onChange={(e) => handleChange('lightEngineSerialNumber', e.target.value)}
                  placeholder="LE Serial No."
                  className="border-2 border-black text-black text-sm"
                />
              </FormField>
            </FormSection>

            {/* Service Images */}
            <FormSection title="Service Images">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Upload reference images for this visit (you can add multiple images).
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                className="w-full border-2 border-dashed border-black p-4 text-sm bg-gray-50"
              />
              {imageFiles.length > 0 && (
                <ul className="text-xs sm:text-sm text-gray-700 list-disc pl-5">
                  {imageFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              )}
            </FormSection>
      </div>

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
          className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold flex-1"
        >
          Continue to Signatures
        </Button>
      </div>
    </div>
  )
}
