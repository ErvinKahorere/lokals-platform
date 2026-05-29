import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  CircleAlert,
  Droplets,
  FileWarning,
  LoaderCircle,
  MapPinned,
  Mic,
  ShieldCheck,
  Trash2,
  Upload,
  Video,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Input, PageHeader, SectionCard, TextArea } from '../components/Ui'
import { LocationPickerMap } from '../components/maps/LocationPickerMap'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
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

type FormErrors = Partial<Record<'title' | 'category' | 'priority' | 'location' | 'description', string>>

type SubmitSuccess = {
  reference?: string | null
  status?: string | null
}

type CategoryOption = {
  value: string
  label: string
  icon: LucideIcon
  detail: string
  accentClass: string
  iconClass: string
}

const issueCategories: CategoryOption[] = [
  {
    value: 'water',
    label: 'Water',
    icon: Droplets,
    detail: 'Leaks, burst pipes, no supply, or water pressure issues.',
    accentClass: 'border-sky-200/70 bg-sky-50/80',
    iconClass: 'bg-sky-100 text-sky-700',
  },
  {
    value: 'roads',
    label: 'Roads',
    icon: MapPinned,
    detail: 'Potholes, blocked access, signage, or dangerous road conditions.',
    accentClass: 'border-amber-200/70 bg-amber-50/80',
    iconClass: 'bg-amber-100 text-amber-700',
  },
  {
    value: 'electricity',
    label: 'Electricity',
    icon: Zap,
    detail: 'Power outages, exposed wires, or damaged municipal lighting.',
    accentClass: 'border-yellow-200/70 bg-yellow-50/80',
    iconClass: 'bg-yellow-100 text-yellow-700',
  },
  {
    value: 'waste',
    label: 'Waste',
    icon: Trash2,
    detail: 'Uncollected refuse, illegal dumping, or overflowing bins.',
    accentClass: 'border-emerald-200/70 bg-emerald-50/80',
    iconClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    value: 'safety',
    label: 'Safety',
    icon: ShieldCheck,
    detail: 'Unsafe spaces, damaged public assets, or urgent public safety concerns.',
    accentClass: 'border-rose-200/70 bg-rose-50/80',
    iconClass: 'bg-rose-100 text-rose-700',
  },
  {
    value: 'other',
    label: 'Other',
    icon: FileWarning,
    detail: 'Use when the issue does not fit the listed city service categories.',
    accentClass: 'border-slate-200/70 bg-slate-50/80',
    iconClass: 'bg-slate-100 text-slate-700',
  },
]

const priorities = [
  {
    value: 'low',
    label: 'Low',
    detail: 'Useful to log, but not urgent today.',
    toneClass: 'border-slate-200 bg-slate-50 text-slate-700',
  },
  {
    value: 'medium',
    label: 'Medium',
    detail: 'Needs attention soon and affects normal use.',
    toneClass: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    value: 'high',
    label: 'High',
    detail: 'Urgent or unsafe and should reach the town team quickly.',
    toneClass: 'border-rose-200 bg-rose-50 text-rose-700',
  },
] as const

const reportSteps = [
  { key: 'issue', title: 'Issue', detail: 'Choose category and urgency' },
  { key: 'location', title: 'Location', detail: 'Confirm where the issue is' },
  { key: 'details', title: 'Details', detail: 'Describe and attach evidence' },
  { key: 'review', title: 'Review', detail: 'Check before sending' },
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
  if (kind === 'document') return <Upload className="h-4 w-4" />
  return <Camera className="h-4 w-4" />
}

function formatLabel(value?: string | null) {
  if (!value) return 'Submitted'
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

export function ReportIssuePage() {
  const [step, setStep] = useState(0)
  const [success, setSuccess] = useState<SubmitSuccess | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [area, setArea] = useState('Nau-Aib')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('water')
  const [priority, setPriority] = useState('medium')
  const [location, setLocation] = useState('Nau-Aib, Okahandja')
  const [description, setDescription] = useState('')
  const [coordinates, setCoordinates] = useState<LocationPoint | null>(null)
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([])
  const [isLocating, setIsLocating] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const createReport = useCreateReport()
  const aiAssist = useAiAssist('issue-report')

  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => URL.revokeObjectURL(attachment.url))
    }
  }, [attachments])

  const imagePreview = useMemo(
    () => attachments.find((attachment) => attachment.kind === 'image'),
    [attachments],
  )

  const selectedCategory = issueCategories.find((item) => item.value === category) ?? issueCategories[0]
  const selectedPriority = priorities.find((item) => item.value === priority) ?? priorities[1]

  const setFieldError = (field: keyof FormErrors, value?: string) => {
    setFormErrors((current) => {
      const next = { ...current }
      if (value) {
        next[field] = value
      } else {
        delete next[field]
      }
      return next
    })
  }

  const handleFiles = (files: FileList | null) => {
    setErrorMessage('')
    setAiMessage('')
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

  const validateStep = (targetStep: number) => {
    const nextErrors: FormErrors = {}

    if (targetStep >= 0 && !category) nextErrors.category = 'Choose the issue category so it reaches the right team.'
    if (targetStep >= 0 && !priority) nextErrors.priority = 'Select the urgency level.'
    if (targetStep >= 1 && !location.trim()) nextErrors.location = 'Add the address, area, or landmark residents can recognize.'
    if (targetStep >= 2 && !title.trim()) nextErrors.title = 'Add a short clear title for the issue.'
    if (targetStep >= 2 && !description.trim()) nextErrors.description = 'Describe what happened and what people should know.'

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const goNext = () => {
    const target = Math.min(step + 1, reportSteps.length - 1)
    if (!validateStep(target - 1)) return
    setStep(target)
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
        setFieldError('location')
        setIsLocating(false)
      },
      () => {
        setErrorMessage('We could not read your location. Check browser permissions or enter the address manually.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const analyzeWithAi = async () => {
    setErrorMessage('')
    setAiMessage('')

    try {
      const payload = new FormData()
      payload.append('title', title)
      payload.append('description', description)
      payload.append('location', location)
      const firstAttachment = attachments[0]?.file
      if (firstAttachment) {
        payload.append('media', firstAttachment)
      }

      const response = await aiAssist.mutateAsync(payload)
      const suggestion = response.data.suggestions?.[0]?.content ?? {}

      if (!title.trim() && suggestion.title) setTitle(String(suggestion.title))
      if (!description.trim() && suggestion.description) setDescription(String(suggestion.description))
      if (suggestion.category) setCategory(String(suggestion.category))

      setAiMessage('AI suggestions added. Review the wording before you send it to the town team.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'AI suggestions are not available right now. You can still submit manually.'))
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setAiMessage('')

    if (!validateStep(reportSteps.length - 1)) {
      setStep(0)
      return
    }

    try {
      const payload = new FormData()
      payload.append('category', category)
      payload.append('title', title)
      payload.append('description', description)
      payload.append('location', location)
      payload.append('town', PILOT_TOWN)
      payload.append('area', area)
      payload.append('priority', priority)
      if (coordinates) {
        payload.append('lat', String(coordinates.lat))
        payload.append('lng', String(coordinates.lng))
      }

      attachments.forEach((attachment) => payload.append('attachments[]', attachment.file))

      const response = await createReport.mutateAsync(payload)
      setSuccess({
        reference: response.data?.reference_code ?? response.reference_code ?? null,
        status: response.data?.status ?? response.status ?? 'submitted',
      })
      setStep(reportSteps.length - 1)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'We could not submit this report right now.'))
    }
  }

  if (success) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Resident services"
          title="Report sent"
          description="Your issue has been packaged clearly for the relevant town team."
        />

        <SectionCard className="mx-auto max-w-3xl bg-white">
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-lokals-green-soft text-lokals-green shadow-card">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-lokals-charcoal">Report submitted successfully</h2>
              <p className="mt-2 text-sm leading-6 text-lokals-muted">
                Sent to relevant town team. Track status from your activity and report history as updates arrive.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Card variant="dashboard" className="p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Reference</p>
                <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{success.reference ?? 'Pending assignment'}</p>
              </Card>
              <Card variant="dashboard" className="p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Status</p>
                <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{formatLabel(success.status)}</p>
              </Card>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                'Sent to relevant town team',
                'Track status from your activity',
                'Photos help speed up response',
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-lokals-border bg-lokals-surface px-4 py-4 text-sm font-medium text-lokals-charcoal">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:justify-center">
              <Link to="/activity"><Button>Open activity</Button></Link>
              <Link to="/dashboard/reports"><Button variant="secondary">View my reports</Button></Link>
              <Button
                variant="secondary"
                onClick={() => {
                  attachments.forEach((attachment) => URL.revokeObjectURL(attachment.url))
                  setAttachments([])
                  setSuccess(null)
                  setErrorMessage('')
                  setAiMessage('')
                  setFormErrors({})
                  setStep(0)
                  setTitle('')
                  setCategory('water')
                  setPriority('medium')
                  setLocation('Nau-Aib, Okahandja')
                  setDescription('')
                  setCoordinates(null)
                  setArea('Nau-Aib')
                }}
              >
                Report another issue
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Resident services"
        title="Report City Issue"
        description="Fast, official issue reporting with guided steps, map context, and trust cues for residents."
      />

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <SectionCard className="h-fit bg-white">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Guided flow</p>
              <h2 className="mt-2 text-2xl font-semibold text-lokals-charcoal">Official city reporting, step by step</h2>
              <p className="mt-2 text-sm leading-6 text-lokals-muted">
                Keep the details clear, add location context, and send the issue to the right municipal team faster.
              </p>
            </div>

            <div className="space-y-3">
              {reportSteps.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (index <= step || validateStep(index - 1)) setStep(index)
                  }}
                  className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                    index === step
                      ? 'border-lokals-green/30 bg-lokals-green-soft/50 shadow-card'
                      : index < step
                        ? 'border-lokals-purple/15 bg-lokals-purple-soft/40'
                        : 'border-lokals-border bg-lokals-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${
                      index === step ? 'bg-lokals-green text-white' : index < step ? 'bg-lokals-purple text-white' : 'bg-white text-lokals-muted'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{item.detail}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <Card variant="dashboard" className="space-y-3 p-4">
              <p className="text-sm font-semibold text-lokals-charcoal">Trust cues</p>
              <div className="space-y-2 text-sm text-lokals-muted">
                <p>Sent to relevant town team</p>
                <p>Track status from your activity</p>
                <p>Photos help speed up response</p>
              </div>
            </Card>
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <form className="space-y-5" onSubmit={submit}>
            {step === 0 ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Step 1</p>
                  <h2 className="mt-1 text-2xl font-semibold text-lokals-charcoal">What kind of issue is this?</h2>
                  <p className="mt-2 text-sm text-lokals-muted">Choose the category and urgency so the right municipal queue sees it first.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {issueCategories.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setCategory(option.value)
                        setFieldError('category')
                      }}
                      className={`rounded-[24px] border p-4 text-left transition ${
                        category === option.value ? `${option.accentClass} shadow-card` : 'border-lokals-border bg-white hover:border-lokals-green/25'
                      }`}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${option.iconClass}`}>
                        <option.icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 font-semibold text-lokals-charcoal">{option.label}</p>
                      <p className="mt-2 text-sm leading-6 text-lokals-muted">{option.detail}</p>
                    </button>
                  ))}
                </div>
                {formErrors.category ? <InlineError message={formErrors.category} /> : null}

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-lokals-charcoal">Urgency</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {priorities.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setPriority(option.value)
                          setFieldError('priority')
                        }}
                        className={`rounded-[22px] border px-4 py-4 text-left transition ${
                          priority === option.value ? `${option.toneClass} shadow-card` : 'border-lokals-border bg-white'
                        }`}
                      >
                        <p className="font-semibold">{option.label}</p>
                        <p className="mt-2 text-sm leading-6 text-lokals-muted">{option.detail}</p>
                      </button>
                    ))}
                  </div>
                  {formErrors.priority ? <InlineError message={formErrors.priority} /> : null}
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Step 2</p>
                  <h2 className="mt-1 text-2xl font-semibold text-lokals-charcoal">Where is the issue?</h2>
                  <p className="mt-2 text-sm text-lokals-muted">Choose the area, confirm the address or landmark, and place a map pin if you can.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {OKAHANDJA_AREAS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setArea(option)
                        if (!location.trim() || location.includes(PILOT_TOWN)) {
                          setLocation(`${option}, ${PILOT_TOWN}`)
                        }
                      }}
                      className={`rounded-[20px] border px-4 py-3 text-left text-sm font-semibold transition ${
                        area === option ? 'border-lokals-green/30 bg-lokals-green-soft/50 text-lokals-green' : 'border-lokals-border bg-white text-lokals-charcoal'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                  <span>Address or landmark</span>
                  <Input
                    name="location"
                    placeholder="Nau-Aib, near the bus stop"
                    value={location}
                    onChange={(event) => {
                      setLocation(event.target.value)
                      setFieldError('location')
                    }}
                  />
                </label>
                {formErrors.location ? <InlineError message={formErrors.location} /> : null}

                <div className="flex justify-end">
                  <Button type="button" variant="secondary" onClick={handleUseCurrentLocation} disabled={isLocating}>
                    {isLocating ? <><LoaderCircle className="h-4 w-4 animate-spin" />Finding location...</> : <><MapPinned className="h-4 w-4" />Use current location</>}
                  </Button>
                </div>

                <LocationPickerMap
                  label="Issue map pin"
                  value={coordinates}
                  onChange={setCoordinates}
                  helpText="Tap to place the issue pin. If the map is unavailable, the address above is still enough to submit the report."
                />
                <p className="text-sm text-lokals-muted">Selected coordinates: {formatCoordinates(coordinates)}</p>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Step 3</p>
                  <h2 className="mt-1 text-2xl font-semibold text-lokals-charcoal">Describe what residents are seeing</h2>
                  <p className="mt-2 text-sm text-lokals-muted">Short, practical detail helps the town team triage faster.</p>
                </div>

                <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                  <span>Short title</span>
                  <Input
                    name="title"
                    placeholder="Burst pipe near the taxi rank"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value)
                      setFieldError('title')
                    }}
                  />
                </label>
                {formErrors.title ? <InlineError message={formErrors.title} /> : null}

                <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                  <span>Description</span>
                  <TextArea
                    name="description"
                    placeholder="Explain what happened, when it started, and what residents should avoid."
                    rows={5}
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value)
                      setFieldError('description')
                    }}
                  />
                  <p className="text-xs text-lokals-muted">Include what is affected, how serious it feels, and any landmark the team should use.</p>
                </label>
                {formErrors.description ? <InlineError message={formErrors.description} /> : null}

                <div className="space-y-3">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-lokals-border bg-slate-50 px-5 py-8 text-center">
                    {imagePreview ? (
                      <img src={imagePreview.url} alt="Issue preview" className="mb-4 h-40 w-full rounded-[20px] object-cover" />
                    ) : (
                      <Camera className="mb-3 h-8 w-8 text-lokals-purple" />
                    )}
                    <span className="font-semibold text-lokals-charcoal">Add photos, video, or voice notes</span>
                    <span className="mt-2 text-sm text-lokals-muted">Photos help speed up response. You can attach up to 6 files showing the issue clearly.</span>
                    <input
                      type="file"
                      accept="image/*,video/*,audio/*"
                      multiple
                      capture="environment"
                      className="hidden"
                      onChange={(event) => handleFiles(event.target.files)}
                    />
                  </label>

                  {attachments.length ? (
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
                  ) : (
                    <EmptyState title="No files added yet" body="You can still submit without media, but a clear photo often helps the town team assess faster." />
                  )}
                </div>

                <Button type="button" variant="secondary" className="w-full" onClick={() => void analyzeWithAi()}>
                  {aiAssist.isPending ? 'Analyzing...' : 'Analyze with AI'}
                </Button>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Step 4</p>
                  <h2 className="mt-1 text-2xl font-semibold text-lokals-charcoal">Review before sending</h2>
                  <p className="mt-2 text-sm text-lokals-muted">Make sure the category, urgency, location, and description are clear before this reaches the town team.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ReviewCard label="Category" value={selectedCategory.label} detail={selectedCategory.detail} />
                  <ReviewCard label="Urgency" value={selectedPriority.label} detail={selectedPriority.detail} />
                  <ReviewCard label="Area" value={area} detail={location} />
                  <ReviewCard label="Evidence" value={attachments.length ? `${attachments.length} file${attachments.length === 1 ? '' : 's'}` : 'No media added'} detail="Photos help speed up response." />
                </div>

                <Card variant="dashboard" className="space-y-3 p-5">
                  <p className="font-semibold text-lokals-charcoal">{title || 'Untitled report'}</p>
                  <p className="text-sm leading-6 text-lokals-muted">{description || 'No description added yet.'}</p>
                  <p className="text-sm text-lokals-muted">Coordinates: {formatCoordinates(coordinates)}</p>
                </Card>
              </div>
            ) : null}

            {errorMessage ? <InlineError message={errorMessage} tone="danger" /> : null}
            {aiMessage ? <InlineError message={aiMessage} tone="success" /> : null}

            <div className="flex flex-col gap-3 border-t border-lokals-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                {step > 0 ? (
                  <Button type="button" variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))}>
                    Back
                  </Button>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {step < reportSteps.length - 1 ? (
                  <Button type="button" onClick={goNext}>
                    Next step
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" isLoading={createReport.isPending} loadingLabel="Submitting report...">
                    Submit report
                  </Button>
                )}
              </div>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}

function InlineError({
  message,
  tone = 'warning',
}: {
  message: string
  tone?: 'warning' | 'danger' | 'success'
}) {
  const palette =
    tone === 'danger'
      ? 'border-red-200 bg-red-50 text-red-700'
      : tone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-amber-200 bg-amber-50 text-amber-800'

  return (
    <div className={`flex items-start gap-2 rounded-[18px] border px-4 py-3 text-sm ${palette}`}>
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function ReviewCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <Card variant="dashboard" className="p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">{label}</p>
      <p className="mt-2 font-semibold text-lokals-charcoal">{value}</p>
      <p className="mt-2 text-sm leading-6 text-lokals-muted">{detail}</p>
    </Card>
  )
}
