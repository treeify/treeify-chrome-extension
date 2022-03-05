const GOOGLE_DRIVE_SYNCED_AT = 'GOOGLE_DRIVE_SYNCED_AT'
let googleDriveSyncedAt: string | undefined

export function getGoogleDriveSyncedAt(): string | undefined {
  if (googleDriveSyncedAt !== undefined) {
    googleDriveSyncedAt = localStorage.getItem(GOOGLE_DRIVE_SYNCED_AT) ?? undefined
  }

  return googleDriveSyncedAt
}

export function setGoogleDriveSyncedAt(dateString: string) {
  googleDriveSyncedAt = dateString
  localStorage.setItem(GOOGLE_DRIVE_SYNCED_AT, dateString)
}
