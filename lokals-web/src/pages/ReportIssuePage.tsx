import { useState } from 'react'
import type { FormEvent } from 'react'
import { Camera } from 'lucide-react'
import { PageHeader, SectionCard, Input, Select, TextArea } from '../components/Ui'
import { useCreateReport } from '../hooks/queries'

export function ReportIssuePage() {
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState('')
  const createReport = useCreateReport()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const payload = new FormData()
    payload.append('category', String(formData.get('category') ?? ''))
    payload.append('title', String(formData.get('title') ?? ''))
    payload.append('description', String(formData.get('description') ?? ''))
    payload.append('location', String(formData.get('location') ?? ''))
    payload.append('town', 'Windhoek')
    payload.append('priority', String(formData.get('priority') ?? 'medium'))
    const photo = formData.get('photo')
    if (photo instanceof File && photo.size > 0) {
      payload.append('photo', photo)
    }
    await createReport.mutateAsync(payload)
    setMessage('Report submitted.')
    event.currentTarget.reset()
    setPreview('')
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="City services" title="Report an issue quickly" description="Short forms keep public service reporting usable on low-end phones and slower networks." />
      <SectionCard className="mx-auto max-w-2xl">
        <form className="space-y-4" onSubmit={submit}>
          <Input name="title" placeholder="Short title" required />
          <div className="grid gap-4 md:grid-cols-2">
            <Select name="category" defaultValue="water">
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="roads">Roads</option>
              <option value="waste">Waste</option>
              <option value="safety">Safety</option>
              <option value="other">Other</option>
            </Select>
            <Select name="priority" defaultValue="medium">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <TextArea name="description" placeholder="Describe the issue" rows={5} required />
          <Input name="location" placeholder="Location" required />
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-lokals-border bg-slate-50 px-5 py-8 text-center">
            {preview ? <img src={preview} alt="Issue preview" className="mb-4 h-40 w-full rounded-[20px] object-cover" /> : <Camera className="mb-3 h-8 w-8 text-lokals-purple" />}
            <span className="font-semibold text-lokals-charcoal">Add a photo</span>
            <span className="mt-2 text-sm text-lokals-muted">A photo can help the city team verify the issue faster.</span>
            <input type="file" name="photo" accept="image/*" capture="environment" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0]
              setPreview(file ? URL.createObjectURL(file) : '')
            }} />
          </label>
          {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
          <button className="w-full rounded-2xl bg-[var(--brand)] px-4 py-3 font-semibold text-white" disabled={createReport.isPending}>
            {createReport.isPending ? 'Submitting...' : 'Report issue'}
          </button>
        </form>
      </SectionCard>
    </div>
  )
}
