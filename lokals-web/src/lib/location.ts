export type LocationPoint = {
  lat: number
  lng: number
}

export const OKAHANDJA_CENTER: LocationPoint = {
  lat: -21.9836,
  lng: 16.917,
}

export const OKAHANDJA_LABEL = 'Okahandja'

export function haversineDistanceKm(start?: LocationPoint | null, end?: LocationPoint | null): number | null {
  if (!start || !end) return null

  const earthRadiusKm = 6371
  const latDelta = toRadians(end.lat - start.lat)
  const lngDelta = toRadians(end.lng - start.lng)
  const a = Math.sin(latDelta / 2) ** 2
    + Math.cos(toRadians(start.lat)) * Math.cos(toRadians(end.lat)) * Math.sin(lngDelta / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(earthRadiusKm * c * 10) / 10
}

export function formatCoordinates(point?: LocationPoint | null): string {
  if (!point) return 'No coordinates selected'

  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
}

export function openStreetMapUrl(point?: LocationPoint | null, zoom = 16): string | null {
  if (!point) return null

  return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=${zoom}/${point.lat}/${point.lng}`
}

export function estimatedRideMinutes(distanceKm?: number | null): number | null {
  if (distanceKm == null) return null
  return Math.max(6, Math.round(distanceKm * 2.3))
}

export function estimatedDeliveryMinutes(distanceKm?: number | null): number | null {
  if (distanceKm == null) return null
  return Math.max(8, Math.round(distanceKm * 3.1))
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}
