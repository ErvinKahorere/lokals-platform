import type { LatLngTuple } from 'leaflet'
import { useEffect } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet'
import { openStreetMapUrl, type LocationPoint, OKAHANDJA_CENTER } from '../../lib/location'

type LocationPreviewMapProps = {
  primary?: LocationPoint | null
  secondary?: LocationPoint | null
  primaryLabel?: string
  secondaryLabel?: string
}

function FitMap({ primary, secondary }: { primary?: LocationPoint | null; secondary?: LocationPoint | null }) {
  const map = useMap()

  useEffect(() => {
    if (primary && secondary) {
      map.fitBounds(
        [
          [primary.lat, primary.lng],
          [secondary.lat, secondary.lng],
        ],
        { padding: [32, 32] },
      )
      return
    }

    if (primary) {
      map.setView([primary.lat, primary.lng], 15)
      return
    }

    map.setView([OKAHANDJA_CENTER.lat, OKAHANDJA_CENTER.lng], 13)
  }, [map, primary, secondary])

  return null
}

export function LocationPreviewMap(props: LocationPreviewMapProps) {
  const { primary, secondary } = props
  const link = openStreetMapUrl(primary ?? secondary ?? null)
  const center: LatLngTuple = [OKAHANDJA_CENTER.lat, OKAHANDJA_CENTER.lng]

  return (
    <div className="rounded-[24px] border border-lokals-border bg-slate-50 p-4">
      <div className="overflow-hidden rounded-[20px] border border-lokals-border bg-white">
        <MapContainer center={center} zoom={13} className="h-64 w-full" scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitMap primary={primary} secondary={secondary} />
          {primary ? (
            <CircleMarker center={[primary.lat, primary.lng]} pathOptions={{ color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.95 }} radius={9} />
          ) : null}
          {secondary ? (
            <CircleMarker center={[secondary.lat, secondary.lng]} pathOptions={{ color: '#DC2626', fillColor: '#DC2626', fillOpacity: 0.95 }} radius={9} />
          ) : null}
        </MapContainer>
      </div>

      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm font-semibold text-lokals-green"
        >
          Open in OpenStreetMap
        </a>
      ) : (
        <p className="mt-3 text-sm text-lokals-muted">
          A map preview will appear here once coordinates are available. Manual address details still remain visible above.
        </p>
      )}
    </div>
  )
}
