import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AvatarUploader } from '../../components/account/AvatarUploader'
import { interestOptions, roleLabel, roleOptions } from '../../components/account/accountUtils'
import { Button, Input, PageHeader, SectionCard, TextArea } from '../../components/Ui'
import { useMe, useUpdateProfile, useUploadProfileAvatar } from '../../hooks/queries'

export function EditProfilePage() {
  const navigate = useNavigate()
  const { data } = useMe()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadProfileAvatar()
  const user = useMemo(() => {
    const payload = data?.user
    if (!payload) {
      return undefined
    }

    return 'data' in payload ? payload.data : payload
  }, [data])
  const [preview, setPreview] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    bio: '',
    profession: '',
    business_name: '',
    default_town: '',
    default_area: '',
    whatsapp: '',
    secondary_phone: '',
    profile_visibility: 'public',
  })

  useEffect(() => {
    if (!user) {
      return
    }

    setForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      email: user.email ?? '',
      location: user.location ?? '',
      bio: user.bio ?? user.profile?.bio ?? '',
      profession: user.profession ?? user.profile?.profession ?? '',
      business_name: user.business_name ?? user.profile?.business_name ?? '',
      default_town: user.default_town ?? user.profile?.default_town ?? '',
      default_area: user.default_area ?? user.profile?.default_area ?? '',
      whatsapp: user.whatsapp ?? user.profile?.whatsapp ?? '',
      secondary_phone: user.secondary_phone ?? user.profile?.secondary_phone ?? '',
      profile_visibility: user.profile_visibility ?? user.profile?.profile_visibility ?? 'public',
    })
    setRoles(user.roles ?? ['citizen'])
    setInterests(user.preferences?.interests ?? [])
  }, [user])

  const toggleChoice = (value: string, items: string[], setItems: (items: string[]) => void) => {
    setItems(items.includes(value) ? items.filter((item) => item !== value) : [...items, value])
  }

  const handleAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setPreview(URL.createObjectURL(file))
    await uploadAvatar.mutateAsync(file)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await updateProfile.mutateAsync({
      ...form,
      roles,
      interests,
    })
    navigate('/dashboard/profile')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Edit your profile"
        description="Keep your contact details, role setup, and location ready for bookings, jobs, selling, and local updates."
        actions={<Link to="/dashboard/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-lokals-purple"><ArrowLeft className="h-4 w-4" />Back to profile</Link>}
      />

      <SectionCard className="bg-white">
        <AvatarUploader
          name={user?.name ?? 'LOKALS User'}
          src={user?.avatar ?? user?.profile?.avatar_url ?? null}
          preview={preview}
          isUploading={uploadAvatar.isPending}
          onChange={handleAvatar}
        />
      </SectionCard>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <SectionCard className="bg-white">
          <h3 className="text-lg font-semibold text-lokals-charcoal">Personal details</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal"><span>Full name</span><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Your full name" required /></label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal"><span>Phone</span><Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="+264..." required /></label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal"><span>Email</span><Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Optional email" /></label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal"><span>WhatsApp</span><Input value={form.whatsapp} onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))} placeholder="WhatsApp number" /></label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal"><span>Profession</span><Input value={form.profession} onChange={(event) => setForm((current) => ({ ...current, profession: event.target.value }))} placeholder="Profession or role" /></label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal"><span>Business name</span><Input value={form.business_name} onChange={(event) => setForm((current) => ({ ...current, business_name: event.target.value }))} placeholder="Business or brand name" /></label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal md:col-span-2"><span>Bio</span><TextArea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} placeholder="Tell people a little about you." rows={4} /></label>
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <h3 className="text-lg font-semibold text-lokals-charcoal">Location and visibility</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal"><span>Location label</span><Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Katutura, Windhoek" /></label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal"><span>Profile visibility</span><select value={form.profile_visibility} onChange={(event) => setForm((current) => ({ ...current, profile_visibility: event.target.value }))} className="min-h-11 w-full rounded-lokals-lg border border-lokals-border bg-lokals-surface px-4 py-3 text-sm text-lokals-charcoal"><option value="public">Public</option><option value="private">Private</option></select></label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal"><span>Default town</span><Input value={form.default_town} onChange={(event) => setForm((current) => ({ ...current, default_town: event.target.value }))} placeholder="Windhoek" /></label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal"><span>Default area</span><Input value={form.default_area} onChange={(event) => setForm((current) => ({ ...current, default_area: event.target.value }))} placeholder="Eros or Katutura" /></label>
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <h3 className="text-lg font-semibold text-lokals-charcoal">Roles and interests</h3>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-lokals-charcoal">Available roles</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {roleOptions.map((role) => (
                  <button key={role} type="button" onClick={() => toggleChoice(role, roles, setRoles)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${roles.includes(role) ? 'bg-lokals-purple text-white shadow-card' : 'border border-lokals-border bg-white text-lokals-charcoal'}`}>
                    {roleLabel(role)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-lokals-charcoal">Interests</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <button key={interest} type="button" onClick={() => toggleChoice(interest, interests, setInterests)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${interests.includes(interest) ? 'bg-emerald-600 text-white shadow-card' : 'border border-lokals-border bg-white text-lokals-charcoal'}`}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-[24px] border border-lokals-border bg-white px-5 py-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-2 text-sm text-lokals-muted">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Saved details are reused across LOKALS.
          </div>
          <Button disabled={updateProfile.isPending}>{updateProfile.isPending ? 'Saving profile...' : 'Save profile'}</Button>
        </div>
      </form>
    </div>
  )
}
