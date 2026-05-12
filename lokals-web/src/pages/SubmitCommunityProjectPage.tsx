import { useState } from 'react'
import { Button, Card, PageHeader } from '../components/Ui'
import { useCommunityProjectCategories, useCreateCommunityProject } from '../hooks/queries'

export function SubmitCommunityProjectPage() {
  const categoriesQuery = useCommunityProjectCategories()
  const createMutation = useCreateCommunityProject()
  const [saveAsDraft, setSaveAsDraft] = useState(false)
  const [success, setSuccess] = useState<{ reference?: string; status?: string } | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Get involved" title="Submit a community initiative" description="Every project is reviewed by the Town Manager before public visibility." />
      {success ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-lokals-charcoal">Submitted for Town Manager verification</h2>
          <p className="mt-2 text-sm text-lokals-muted">Reference: {success.reference}</p>
          <p className="mt-2 text-sm text-lokals-muted">Status: {success.status}</p>
        </Card>
      ) : null}
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          const payload = new FormData()
          payload.set('category_id', String(form.get('category_id') ?? ''))
          payload.set('title', String(form.get('title') ?? ''))
          payload.set('summary', String(form.get('summary') ?? ''))
          payload.set('description', String(form.get('description') ?? ''))
          payload.set('location_text', String(form.get('location_text') ?? ''))
          payload.set('contact_name', String(form.get('contact_name') ?? ''))
          payload.set('contact_phone', String(form.get('contact_phone') ?? ''))
          payload.set('contact_whatsapp', String(form.get('contact_whatsapp') ?? ''))
          payload.set('contact_email', String(form.get('contact_email') ?? ''))
          payload.set('status', saveAsDraft ? 'draft' : 'submitted')
          payload.set('submit_for_review', saveAsDraft ? '0' : '1')

          form.getAll('support_needed').forEach((value) => payload.append('support_needed[]', String(value)))
          if (form.get('target_amount')) payload.set('target_amount', String(form.get('target_amount')))
          if (form.get('target_volunteers')) payload.set('target_volunteers', String(form.get('target_volunteers')))

          const multiple = form.getAll('attachments[]')
          multiple.forEach((file) => {
            if (file instanceof File && file.size > 0) {
              payload.append('attachments[]', file)
            }
          })

          createMutation.mutate(payload, {
            onSuccess: (response: any) => {
              setSuccess({
                reference: response?.data?.reference_code,
                status: response?.data?.status,
              })
            },
          })
        }}
      >
        <Card className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Step 1</p>
          <h2 className="text-lg font-semibold text-lokals-charcoal">Choose a category</h2>
          <select name="category_id" required className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple">
            <option value="">Select category</option>
            {(categoriesQuery.data?.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </Card>

        <Card className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Step 2</p>
          <h2 className="text-lg font-semibold text-lokals-charcoal">Project title and summary</h2>
          <input name="title" required className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Project title" />
          <textarea name="summary" required rows={2} className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Short summary" />
          <textarea name="description" required rows={5} className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Full description" />
        </Card>

        <Card className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Step 3</p>
          <h2 className="text-lg font-semibold text-lokals-charcoal">Support needed</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {['Donations', 'Volunteers', 'Skills/services', 'Materials', 'Food/clothing support', 'School support', 'Medical support', 'Community cleanup support', 'Sports/youth support', 'Elderly/vulnerable support', 'Sponsorship', 'Other community help'].map((item) => (
              <label key={item} className="flex items-center gap-3 rounded-[18px] border border-lokals-border px-4 py-3 text-sm font-medium text-lokals-charcoal">
                <input type="checkbox" name="support_needed" value={item} />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="target_amount" type="number" min="0" step="0.01" className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Funding target (optional)" />
            <input name="target_volunteers" type="number" min="0" step="1" className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Volunteer target (optional)" />
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Step 4</p>
          <h2 className="text-lg font-semibold text-lokals-charcoal">Contact and location</h2>
          <input name="location_text" required className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Location" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="contact_name" required className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Contact name" />
            <input name="contact_phone" className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Contact phone" />
            <input name="contact_whatsapp" className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="WhatsApp" />
            <input name="contact_email" type="email" className="w-full rounded-[18px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple" placeholder="Contact email" />
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Step 5</p>
          <h2 className="text-lg font-semibold text-lokals-charcoal">Attach proof or media</h2>
          <input name="attachments[]" type="file" multiple className="w-full rounded-[18px] border border-dashed border-lokals-border px-4 py-4 text-sm text-lokals-muted" />
        </Card>

        <Card className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Step 6</p>
          <h2 className="text-lg font-semibold text-lokals-charcoal">Review and submit</h2>
          <label className="flex items-center gap-3 rounded-[18px] border border-lokals-border px-4 py-3 text-sm font-medium text-lokals-charcoal">
            <input type="checkbox" checked={saveAsDraft} onChange={(event) => setSaveAsDraft(event.target.checked)} />
            <span>Save as draft first</span>
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Submitting...' : saveAsDraft ? 'Save draft' : 'Submit for review'}</Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
