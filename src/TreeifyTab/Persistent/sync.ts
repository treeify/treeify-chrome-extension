import { assertNonNull, assertNonUndefined } from 'src/Utility/Debug/assert'

const GOOGLE_DRIVE_SYNCED_AT = 'GOOGLE_DRIVE_SYNCED_AT'
let googleDriveSyncedAt: string | undefined

export function getGoogleDriveSyncedAt(): string | undefined {
  if (googleDriveSyncedAt !== undefined) {
    googleDriveSyncedAt = localStorage.getItem(GOOGLE_DRIVE_SYNCED_AT) ?? undefined
  }

  return googleDriveSyncedAt
}

export function setGoogleDriveSyncedAt(dateString: string) {
  // TODO: 同期時に初回同期扱いになる原因不明の不具合への対策兼調査用
  if (dateString === undefined || dateString === null) {
    assertNonNull(dateString)
    assertNonUndefined(dateString)
    return
  }

  googleDriveSyncedAt = dateString
  localStorage.setItem(GOOGLE_DRIVE_SYNCED_AT, dateString)
}
