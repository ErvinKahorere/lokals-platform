import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { BedDouble, Building2, Hotel, House, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AccommodationCard, Button, EmptyState, Input, PageHeader, QueryState, SearchBar, SectionCard, Select, TextArea } from '../components/Ui'
import { isDemoMode } from '../config/appMode'
import { useAccommodations, useCreateAccommodation } from '../hooks/queries'
import type { Accommodation } from '../types'

const tabItems = [
  { value: 'rental', label: 'Rentals', icon: House },
  { value: 'property_sale', label: 'Property Sales', icon: Building2 },
  { value: 'short_stay', label: 'B&B / Short Stay', icon: Hotel },
  { value: 'guest_room', label: 'Rooms', icon: BedDouble },
  { value: 'guesthouse', label: 'Guesthouses', icon: Hotel },
] as const

const periodOptions = ['any', 'night', 'month', 'once'] as const

export function AccommodationPage() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<(typeof tabItems)[number]['value']>('rental')
  const [town, setTown] = useState('Windhoek')
  const [area, setArea] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('any')
  const [bathrooms, setBathrooms] = useState('any')
  const [pricePeriod, setPricePeriod] = useState<(typeof periodOptions)[number]>('any')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'price_low_high' | 'price_high_low'>('newest')
  const [step, setStep] = useState(0)
  const [image, setImage] = useState<File | null>(null)
  const [successListing, setSuccessListing] = useState<Accommodation | null>(null)
  const [form, setForm] = useState({
    title: '',
    type: 'rental',
    town: 'Windhoek',
    area: 'Katutura',
    price: '',
    price_period: 'month',
    phone: '',
    whatsapp: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
    description: '',
    rules: '',
  })

  const accommodationsQuery = useAccommodations({
    ...(search ? { search } : {}),
    ...(town !== 'all' ? { town } : {}),
    ...(area !== 'all' ? { area } : {}),
    ...(pricePeriod !== 'any' ? { price_period: pricePeriod } : {}),
    ...(minPrice ? { min_price: minPrice } : {}),
    ...(maxPrice ? { max_price: maxPrice } : {}),
    ...(bedrooms !== 'any' ? { bedrooms } : {}),
    ...(bathrooms !== 'any' ? { bathrooms } : {}),
    ...(verifiedOnly ? { verified: 1 } : {}),
    sort: sortBy,
  })
  const createAccommodation = useCreateAccommodation()
  const items = useMemo(() => accommodationsQuery.data?.data ?? [], [accommodationsQuery.data])
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (tab === 'short_stay') {
        return item.type === 'bnb' || item.type === 'short_stay'
      }
      return item.type === tab
    })
  }, [items, tab])
  const featured = useMemo(() => items.filter((item) => item.price_period === 'night' || item.is_verified_owner).slice(0, 3), [items])
  const rentalsNearYou = useMemo(() => items.filter((item) => item.type === 'rental').slice(0, 4), [items])
  const bnbNearby = useMemo(() => items.filter((item) => item.type === 'bnb' || item.type === 'short_stay' || item.type === 'guesthouse').slice(0, 4), [items])
  const propertySales = useMemo(() => items.filter((item) => item.type === 'property_sale').slice(0, 4), [items])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (step < 3) {
      setStep((current) => current + 1)
      return
    }

    const payload = new FormData()
    payload.append('type', form.type)
    payload.append('title', form.title)
    payload.append('town', form.town)
    payload.append('area', form.area)
    payload.append('price', form.price)
    payload.append('price_period', form.price_period)
    payload.append('description', form.description)
    if (form.bedrooms) payload.append('bedrooms', form.bedrooms)
    if (form.bathrooms) payload.append('bathrooms', form.bathrooms)
    payload.append('metadata[contact_phone]', form.phone)
    payload.append('metadata[contact_whatsapp]', form.whatsapp || form.phone)
    if (form.amenities.trim()) {
      form.amenities.split(',').map((item) => item.trim()).filter(Boolean).forEach((value, index) => payload.append(`metadata[amenities][${index}]`, value))
    }
    if (form.rules.trim()) {
      form.rules.split(',').map((item) => item.trim()).filter(Boolean).forEach((value, index) => payload.append(`metadata[rules][${index}]`, value))
    }
    if (image) payload.append('image', image)

    if (isDemoMode) {
      setSuccessListing({
        id: -1,
        title: form.title,
        type: form.type,
        price: form.price,
        price_period: form.price_period,
        description: form.description,
        town: form.town,
        area: form.area,
      } as Accommodation)
      return
    }

    const response = await createAccommodation.mutateAsync(payload)
    const listing = (response.data ?? response) as Accommodation
    setSuccessListing(listing)
  }

  const resetPost = () => {
    setSuccessListing(null)
    setStep(0)
    setImage(null)
    setForm({
      title: '',
      type: 'rental',
      town: 'Windhoek',
      area: 'Katutura',
      price: '',
      price_period: 'month',
      phone: '',
      whatsapp: '',
      bedrooms: '',
      bathrooms: '',
      amenities: '',
      description: '',
      rules: '',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Accommodation"
        title="Accommodation"
        description="Browse rentals, B&Bs, guesthouses, rooms, and property for sale near you."
        actions={
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onValueSelect={setSearch}
            recentKey="accommodation"
            suggestions={['Rentals in Windhoek', 'Guesthouse in Eros', 'Room in Katutura', 'House for sale']}
            shortcuts={[{ label: 'Rentals', value: 'rental' }, { label: 'B&B', value: 'bnb' }, { label: 'Property sales', value: 'property sale' }]}
            placeholder="Search rentals, B&Bs, rooms..."
            className="w-full md:w-80"
          />
        }
      />

      <div className="flex flex-wrap gap-3">
        {tabItems.map((item) => {
          const Icon = item.icon
          const active = tab === item.value
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setTab(item.value)
                setForm((current) => ({
                  ...current,
                  type: item.value === 'short_stay' ? 'bnb' : item.value,
                  price_period: item.value === 'property_sale' ? 'once' : item.value === 'rental' ? 'month' : 'night',
                }))
              }}
              className={`inline-flex items-center gap-2 rounded-[18px] px-4 py-2 text-sm font-semibold transition ${active ? 'bg-lokals-purple text-white shadow-card' : 'bg-white text-lokals-charcoal shadow-soft'}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </div>

      <SectionCard className="bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-lokals-purple">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-lokals-charcoal">Filter your area</h2>
            <p className="text-sm text-lokals-muted">Narrow by town, price, bedrooms, bathrooms, and verified hosts.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Select value={town} onChange={(event) => setTown(event.target.value)}>
            <option value="all">All towns</option>
            <option value="Windhoek">Windhoek</option>
            <option value="Swakopmund">Swakopmund</option>
          </Select>
          <Select value={area} onChange={(event) => setArea(event.target.value)}>
            <option value="all">All areas</option>
            <option value="Katutura">Katutura</option>
            <option value="Klein Windhoek">Klein Windhoek</option>
            <option value="Eros">Eros</option>
            <option value="CBD">CBD</option>
            <option value="Otjomuise">Otjomuise</option>
          </Select>
          <Input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min price" />
          <Input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max price" />
          <Select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)}>
            <option value="any">Any bedrooms</option>
            <option value="1">1+ bedrooms</option>
            <option value="2">2+ bedrooms</option>
            <option value="3">3+ bedrooms</option>
          </Select>
          <Select value={bathrooms} onChange={(event) => setBathrooms(event.target.value)}>
            <option value="any">Any bathrooms</option>
            <option value="1">1+ bathrooms</option>
            <option value="2">2+ bathrooms</option>
          </Select>
          <Select value={pricePeriod} onChange={(event) => setPricePeriod(event.target.value as (typeof periodOptions)[number])}>
            <option value="any">Any price period</option>
            <option value="night">Per night</option>
            <option value="month">Per month</option>
            <option value="once">Once-off</option>
          </Select>
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="newest">Recently added</option>
            <option value="price_low_high">Price low-high</option>
            <option value="price_high_low">Price high-low</option>
          </Select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant={verifiedOnly ? 'primary' : 'secondary'} onClick={() => setVerifiedOnly((value) => !value)}>Verified owner/agent</Button>
          <Button variant={sortBy === 'newest' ? 'primary' : 'secondary'} onClick={() => setSortBy('newest')}>Recently added</Button>
        </div>
      </SectionCard>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <QueryState isLoading={accommodationsQuery.isLoading} error={accommodationsQuery.error} empty={items.length === 0}>
            {items.length === 0 ? (
              <EmptyState title="No accommodation found in your area." body="Try another filter." />
            ) : (
              <>
                <SectionCard className="bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-lokals-charcoal">Featured stays</h2>
                      <p className="text-sm text-lokals-muted">Verified short stays and standout local accommodation.</p>
                    </div>
                    <Link to="/accommodation" className="text-sm font-semibold text-lokals-purple">View all</Link>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {featured.map((item) => <AccommodationCard key={item.id} accommodation={item} compact />)}
                  </div>
                </SectionCard>

                <div className="grid gap-4 xl:grid-cols-2">
                  <SectionCard className="bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-lokals-charcoal">Rentals near you</h2>
                        <p className="text-sm text-lokals-muted">Monthly places close to local transport and shops.</p>
                      </div>
                      <Link to="/accommodation" className="text-sm font-semibold text-lokals-purple">View all</Link>
                    </div>
                    <div className="mt-4 space-y-4">
                      {rentalsNearYou.map((item) => <AccommodationCard key={item.id} accommodation={item} compact />)}
                    </div>
                  </SectionCard>

                  <SectionCard className="bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-lokals-charcoal">B&Bs nearby</h2>
                        <p className="text-sm text-lokals-muted">Short stays, guesthouses, and trusted host spaces.</p>
                      </div>
                      <Link to="/accommodation" className="text-sm font-semibold text-lokals-purple">View all</Link>
                    </div>
                    <div className="mt-4 space-y-4">
                      {bnbNearby.map((item) => <AccommodationCard key={item.id} accommodation={item} compact />)}
                    </div>
                  </SectionCard>
                </div>

                <SectionCard className="bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-lokals-charcoal">Property for sale</h2>
                      <p className="text-sm text-lokals-muted">Homes and property listings with local contact details.</p>
                    </div>
                    <Link to="/accommodation" className="text-sm font-semibold text-lokals-purple">View all</Link>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {propertySales.map((item) => <AccommodationCard key={item.id} accommodation={item} />)}
                  </div>
                </SectionCard>

                <SectionCard className="bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-lokals-charcoal">Browse {tabItems.find((item) => item.value === tab)?.label.toLowerCase()}</h2>
                      <p className="text-sm text-lokals-muted">Image-first listings with direct owner or agent contact.</p>
                    </div>
                    <span className="text-sm font-medium text-lokals-muted">{filteredItems.length} listings</span>
                  </div>
                  {filteredItems.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState title="No accommodation found in your area." body="Try another filter." />
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {filteredItems.map((item) => <AccommodationCard key={item.id} accommodation={item} />)}
                    </div>
                  )}
                </SectionCard>
              </>
            )}
          </QueryState>
        </div>

        <SectionCard className="bg-white">
          {successListing ? (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-lokals-charcoal">Accommodation published</p>
              <p className="text-sm text-lokals-muted">Your listing is now live in the accommodation feed.</p>
              <div className="flex gap-2">
                <Link to={successListing.id > 0 ? `/accommodation/${successListing.id}` : '/accommodation'} className="flex-1">
                  <Button className="w-full">View Listing</Button>
                </Link>
                <Button variant="secondary" className="flex-1" onClick={resetPost}>Back to Accommodation</Button>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-lokals-green">
                  <House className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-lokals-charcoal">Post accommodation</h2>
                  <p className="text-sm text-lokals-muted">Photo first, short details, price and location, then publish.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">
                <span className={step === 0 ? 'text-lokals-purple' : ''}>1. Photo</span>
                <span className={step === 1 ? 'text-lokals-purple' : ''}>2. Basics</span>
                <span className={step === 2 ? 'text-lokals-purple' : ''}>3. Price / location</span>
                <span className={step === 3 ? 'text-lokals-purple' : ''}>4. Preview</span>
              </div>
              {step === 0 ? (
                <div className="rounded-[22px] border border-dashed border-lokals-border bg-slate-50 p-4">
                  <input type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => setImage(event.target.files?.[0] ?? null)} className="block w-full text-sm text-lokals-muted" />
                  <p className="mt-3 text-sm text-lokals-muted">{image ? image.name : 'Add a photo or skip for now.'}</p>
                </div>
              ) : null}
              {step === 1 ? (
                <>
                  <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Listing title" required />
                  <Select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                    <option value="rental">Rental</option>
                    <option value="property_sale">Property sale</option>
                    <option value="bnb">B&B</option>
                    <option value="short_stay">Short stay</option>
                    <option value="guest_room">Room</option>
                    <option value="guesthouse">Guesthouse</option>
                  </Select>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input value={form.bedrooms} onChange={(event) => setForm((current) => ({ ...current, bedrooms: event.target.value }))} placeholder="Bedrooms" />
                    <Input value={form.bathrooms} onChange={(event) => setForm((current) => ({ ...current, bathrooms: event.target.value }))} placeholder="Bathrooms" />
                  </div>
                  <Input value={form.amenities} onChange={(event) => setForm((current) => ({ ...current, amenities: event.target.value }))} placeholder="Amenities, comma separated" />
                  <TextArea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Short description" rows={3} />
                </>
              ) : null}
              {step === 2 ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" required />
                    <Select value={form.price_period} onChange={(event) => setForm((current) => ({ ...current, price_period: event.target.value }))}>
                      <option value="night">Per night</option>
                      <option value="month">Per month</option>
                      <option value="once">Once-off</option>
                    </Select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input value={form.town} onChange={(event) => setForm((current) => ({ ...current, town: event.target.value }))} placeholder="Town" required />
                    <Input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} placeholder="Area" required />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Contact phone" required />
                    <Input value={form.whatsapp} onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))} placeholder="WhatsApp (optional)" />
                  </div>
                  <Input value={form.rules} onChange={(event) => setForm((current) => ({ ...current, rules: event.target.value }))} placeholder="Rules, comma separated" />
                </>
              ) : null}
              {step === 3 ? (
                <div className="rounded-[22px] border border-lokals-border bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-lokals-charcoal">{form.title || 'Untitled listing'}</p>
                  <p className="mt-2 text-xl font-bold text-lokals-purple">{form.price ? `N$ ${form.price}` : 'Price on request'}</p>
                  <p className="mt-2 text-sm text-lokals-muted">{[form.area, form.town].filter(Boolean).join(', ')} • {form.price_period}</p>
                  <p className="mt-3 text-sm text-lokals-muted">{form.description || 'Add a short property summary before you publish.'}</p>
                </div>
              ) : null}
              <div className="flex gap-2">
                {step > 0 ? <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep((current) => current - 1)}>Back</Button> : null}
                <Button className="flex-1" disabled={createAccommodation.isPending || (step === 1 && !form.title.trim()) || (step === 2 && (!form.price.trim() || !form.town.trim() || !form.area.trim() || !form.phone.trim()))}>
                  {step < 3 ? (step === 0 ? 'Continue' : step === 1 ? 'Price & location' : 'Preview') : createAccommodation.isPending ? 'Publishing...' : isDemoMode ? 'Preview publish' : 'Publish'}
                </Button>
              </div>
            </form>
          )}
        </SectionCard>
      </section>
    </div>
  )
}
