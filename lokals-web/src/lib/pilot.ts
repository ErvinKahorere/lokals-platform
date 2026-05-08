export const PILOT_TOWN = 'Okahandja'

export const PILOT_LOCATION_MESSAGE = 'LOKALS is currently piloting in Okahandja.'

export const OKAHANDJA_AREAS = [
  'Central Okahandja',
  'Nau-Aib',
  'Veddersdal',
  'Five Rand',
  'Smarties',
  'Ekunde',
  'Oshetu',
  'Osona',
  'Extension 5',
  'Extension 6',
  'Gross Barmen Road Area',
  'Okahandja Industrial Area',
  'Okahandja Park',
  'Vyf Rand',
  'Nooitgedacht Area',
] as const

export type OkahandjaArea = (typeof OKAHANDJA_AREAS)[number]

export function applyPilotLocation<T extends Record<string, string | number | boolean | undefined> | undefined>(
  params?: T,
): Record<string, string | number | boolean | undefined> {
  return {
    ...params,
    town: PILOT_TOWN,
    area: params?.area,
  }
}

export function normalizePilotArea(value?: string | null) {
  if (!value) return ''
  return OKAHANDJA_AREAS.find((area) => area.toLowerCase() === value.toLowerCase()) ?? ''
}
