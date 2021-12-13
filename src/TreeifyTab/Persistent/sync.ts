import { State } from 'src/TreeifyTab/Internal/State'

export function getSyncedAt(syncWith: State['syncWith']): string | undefined {
  return localStorage.getItem(makeSyncedAtKey(syncWith)) ?? undefined
}

export function setSyncedAt(syncWith: State['syncWith'], dateString: string) {
  localStorage.setItem(makeSyncedAtKey(syncWith), dateString)
}

function makeSyncedAtKey(syncWith: State['syncWith']) {
  return `syncWith/${syncWith}`
}
