import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Camera, LoaderCircle, MapPinned, Mic, Video } from 'lucide-react'
import { Button, Input, PageHeader, SectionCard, Select, TextArea } from '../components/Ui'
import { LocationPickerMap } from '../components/maps/LocationPickerMap'
import { useAiAssist, useCreateReport } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { formatCoordinates, type LocationPoint } from '../lib/location'
import { OKAHANDJA_AREAS, PILOT_TOWN } from '../lib/pilot'

type AttachmentPreview = {
  key: string
  file: File
  url: string
  kind: 'image' | 'video' | 'audio' | 'document'
}

const issueCategories = [
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'roads', label: 'Roads' },
  { value: 'waste', label: 'Waste' },
  { value: 'safety', label: 'Safety' },
  { value: 'other', label: 'Other' },
] as const

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const

function detectAttachmentKind(file: File): AttachmentPreview['kind'] {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'document'
}

function attachmentIcon(kind: AttachmentPreview['kind']) {
  if (kind === 'video') return <Video className="h-4 w-4" />
  if (kind === 'audio') return <Mic className="h-4 w-4" />
  return <Camera className="h-4 w-4" />
}

export function ReportIssuePage() {
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [area, setArea] = useState('Nau-Aib')
  const [location, setLocation] = useState('Nau-Aib, Okahandja')
  const [coordinates, setCoordinates] = useState<LocationPoint | null>(null)
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([])
  const [isLocating, setIsLocating] = useState(false)
  const createReport = useCreateReport()
  const aiAssist = useAiAssist('issue-report')

  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => URL.revokeObjectURL(attachment.url))
    }
  }, [attachments])

  const hasMedia = attachments.length > 0
  const imagePreview = useMemo(
    () => attachments.find((attachment) => attachment.kind === 'image'),
    [attachments],
  )

  const handleFiles = (files: FileList | null) => {
    setErrorMessage('')
    setMessage('')

    const nextFiles = Array.from(files ?? []).slice(0, 6)
    const nextAttachments = nextFiles.map((file) => ({
      key: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      url: URL.createObjectURL(file),
      kind: detectAttachmentKind(file),
    }))

    setAttachments((current) => {
      current.forEach((attachment) => URL.revokeObjectURL(attachment.url))
      return nextAttachments
    })
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Live location is not available in this browser. Enter the address manually.')
      return
    }

    setIsLocating(true)
    setErrorMessage('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(`${area}, ${PILOT_TOWN}`)
        setCoordinates({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        })
        setMessage('Current location added. You can still adjust the address before submitting.')
        setIsLocating(false)
      },
      () => {
        setErrorMessage('We could not read your location. Check browser permissions or enter the address manually.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setMessage('')

    try {
      const form = event.currentTarget
      const formData = new FormData(form)
      const payload = new FormData()
      payload.append('category', String(formData.get('category') ?? ''))
      payload.append('title', String(formData.get('title') ?? ''))
      payload.append('description', String(formData.get('description') ?? ''))
      payload.append('location', location)
      payload.append('town', PILOT_TOWN)
      payload.append('area', area)
      payload.append('priority', String(formData.get('priority') ?? 'medium'))
      if (coordinates) {
        payload.append('lat', String(coordinates.lat))
        payload.append('lng', String(coordinates.lng))
      }

      attachments.forEach((attachment) => payload.append('attachments[]', attachment.file))

      const response = await createReport.mutateAsync(payload)
      const referenceCode = response.reference_code ? ` Reference: ${response.reference_code}.` : ''
      setMessage(`Report submitted successfully.${referenceCode}`)
      form.reset()
      setAttachments((current) => {
        current.forEach((attachment) => URL.revokeObjectURL(attachment.url))
        return []
      })
      setArea('Nau-Aib')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'We could not submit this report right now.'))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Resident services"
        title="Report an issue"
        description="Send clear report details, location, and supporting media so the town team can respond faster."
      />

      <SectionCard className="mx-auto max-w-3xl bg-white">
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Issue title</span>
              <Input name="title" placeholder="Burst pipe near the taxi rank" required />
            </label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Category</span>
              <Select name="category" defaultValue="water">
                {issueCategories.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Priority</span>
              <Select name="priority" defaultValue="medium">
                {priorities.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Area</span>
              <Select value={area} onChange={(event) => setArea(event.target.value)}>
                {OKAHANDJA_AREAS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </label>
            <div className="flex items-end">
              <Button type="button" variant="secondary" className="w-full" onClick={handleUseCurrentLocation} disabled={isLocating}>
                {isLocating ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Finding location...</> : <><MapPinned className="mr-2 h-4 w-4" />Use current location</>}
              </Button>
            </div>
          </div>

          <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
            <span>Address or landmark</span>
            <Input name="location" placeholder="Nau-Aib, near the bus stop" value={location} onChange={(event) => setLocation(event.target.value)} required />
          </label>

          <LocationPickerMap
            label="Issue map pin"
            value={coordinates}
            onChange={setCoordinates}
            helpText="Tap to place the issue pin. If the map is unavailable, the address above is still enough to submit the report."
          />
          <p className="text-sm text-lokals-muted">Selected coordinates: {formatCoordinates(coordinates)}</p>

          <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
            <span>Detailed description</span>
            <TextArea name="description" placeholder="Explain what happened, when it started, and what residents should avoid." rows={5} required />
          </label>

          <div className="space-y-3">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-lokals-border bg-slate-50 px-5 py-8 text-center">
              {imagePreview ? (
                <img src={imagePreview.url} alt="Issue preview" className="mb-4 h-40 w-full rounded-[20px] object-cover" />
              ) : (
                <Camera className="mb-3 h-8 w-8 text-lokals-purple" />
              )}
              <span className="font-semibold text-lokals-charcoal">Add photos, video, or voice notes</span>
              <span className="mt-2 text-sm text-lokals-muted">You can attach up to 6 files to show what residents are seeing on the ground.</span>
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
            </label>

            {hasMedia ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {attachments.map((attachment) => (
                  <div key={attachment.key} className="rounded-[20px] border border-lokals-border bg-lokals-surface px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-lokals-charcoal">
                      {attachmentIcon(attachment.kind)}
                      <span className="truncate">{attachment.file.name}</span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-lokals-muted">{attachment.kind}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={async () => {
              const form = document.querySelector('form')
              if (!(form instanceof HTMLFormElement)) return

              try {
                const formData = new FormData(form)
                const payload = new FormData()
                payload.append('title', String(formData.get('title') ?? ''))
                payload.append('description', String(formData.get('description') ?? ''))
                payload.append('location', String(formData.get('location') ?? ''))
                const firstAttachment = attachments[0]?.file
                if (firstAttachment) {
                  payload.append('media', firstAttachment)
                }
                const response = await aiAssist.mutateAsync(payload)
                const suggestion = response.data.suggestions?.[0]?.content ?? {}
                const titleInput = form.querySelector<HTMLInputElement>('input[name="title"]')
                const descriptionInput = form.querySelector<HTMLTextAreaElement>('textarea[name="description"]')
                if (titleInput && !titleInput.value) titleInput.value = String(suggestion.title ?? '')
                if (descriptionInput && !descriptionInput.value) descriptionInput.value = String(suggestion.description ?? '')
                setMessage('AI suggestions added. Review and edit before submitting.')
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error, 'AI suggestions are not available right now. You can still submit manually.'))
              }
            }}
          >
            {aiAssist.isPending ? 'Analyzing...' : 'Analyze with AI'}
          </Button>

          {errorMessage ? (
            <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {message}
            </div>
          ) : null}

          <button className="w-full rounded-2xl bg-[var(--brand)] px-4 py-3 font-semibold text-white" disabled={createReport.isPending}>
            {createReport.isPending ? 'Submitting...' : 'Submit report'}
          </button>
        </form>
      </SectionCard>
    </div>
  )
}
