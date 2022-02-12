const GOOGLE_DRIVE_SYNCED_AT = 'GOOGLE_DRIVE_SYNCED_AT'
let googleDriveSyncedAt: string | undefined

export function getSyncedAt(): string | undefined {
  if (googleDriveSyncedAt !== undefined) return googleDriveSyncedAt

  return localStorage.getItem(GOOGLE_DRIVE_SYNCED_AT) ?? undefined
}

export function setSyncedAt(dateString: string) {
  googleDriveSyncedAt = dateString
  localStorage.setItem(GOOGLE_DRIVE_SYNCED_AT, dateString)
}
