const GOOGLE_DRIVE_SYNCED_AT = 'GOOGLE_DRIVE_SYNCED_AT'

export function getSyncedAt(): string | undefined {
  return localStorage.getItem(GOOGLE_DRIVE_SYNCED_AT) ?? undefined
}

export function setSyncedAt(dateString: string) {
  localStorage.setItem(GOOGLE_DRIVE_SYNCED_AT, dateString)
}
