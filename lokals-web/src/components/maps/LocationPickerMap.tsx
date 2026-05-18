import type { LeafletMouseEvent, LatLngTuple } from 'leaflet'
import { LocateFixed, MapPinned } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import { Button } from '../Ui'
import { formatCoordinates, type LocationPoint, OKAHANDJA_CENTER } from '../../lib/location'

type LocationPickerMapProps = {
  label: string
  value: LocationPoint | null
  onChange: (value: LocationPoint) => void
  helpText?: string
}

function ClickCapture({ onSelect }: { onSelect: (value: LocationPoint) => void }) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onSelect({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      })
    },
  })

  return null
}

export function LocationPickerMap({ label, value, onChange, helpText }: LocationPickerMapProps) {
  const [locationMessage, setLocationMessage] = useState<string>('')
  const center = useMemo<LatLngTuple>(() => [value?.lat ?? OKAHANDJA_CENTER.lat, value?.lng ?? OKAHANDJA_CENTER.lng], [value])

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationMessage('Current location is not available in this browser. You can still set the pin manually.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        })
        setLocationMessage('Current location captured. You can still move the pin before you submit.')
      },
      () => {
        setLocationMessage('Location permission was denied. Enter the address manually or tap the map to place a pin.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [onChange])

  return (
    <div className="space-y-3 rounded-[24px] border border-lokals-border bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-lokals-charcoal">{label}</p>
          <p className="mt-1 text-xs text-lokals-muted">{helpText ?? 'Tap the map to place a pin. Manual address entry still works if the map is not used.'}</p>
        </div>
        <Button type="button" variant="secondary" className="min-h-10" onClick={useCurrentLocation}>
          <LocateFixed className="mr-2 h-4 w-4" />
          Use current location
        </Button>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-lokals-border bg-white">
        <MapContainer center={center} zoom={14} className="h-64 w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCapture onSelect={onChange} />
          {value ? (
            <CircleMarker center={[value.lat, value.lng]} pathOptions={{ color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.95 }} radius={9} />
          ) : null}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-lokals-muted">
        <MapPinned className="h-4 w-4 text-lokals-green" />
        <span>{formatCoordinates(value)}</span>
      </div>

      {locationMessage ? (
        <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {locationMessage}
        </div>
      ) : null}
    </div>
  )
}
