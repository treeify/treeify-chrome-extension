import dayjs from 'dayjs'
import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { getTextItemSelectionFromDom } from 'src/TreeifyTab/External/domTextSelection'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Reminder } from 'src/TreeifyTab/Internal/State'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray$ } from 'src/Utility/fp-ts'
import { call } from 'src/Utility/function'
import { Timestamp } from 'src/Utility/Timestamp'

/**
 * ターゲットテキスト項目のテキストが全選択状態でなければテキストを全選択する。
 * それ以外の場合はターゲット項目の兄弟リストを全て選択する。
 */
export function selectAll() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const selection = getTextItemSelectionFromDom()
  if (selection !== undefined) {
    const domishObjects = Internal.instance.state.textItems[targetItemId].domishObjects
    const selectedCharCount = Math.abs(selection.focusDistance - selection.anchorDistance)
    if (DomishObject.getTextLength(domishObjects) !== selectedCharCount) {
      document.execCommand('selectAll')
      return
    }
  }

  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  if (parentItemId === undefined) return
  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds
  const firstSiblingItemId = siblingItemIds[0]
  const lastSiblingItemId = RArray$.lastOrThrow(siblingItemIds)
  const firstSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, firstSiblingItemId)
  const lastSiblingItemPath = ItemPath.createSiblingItemPath(targetItemPath, lastSiblingItemId)
  assertNonUndefined(firstSiblingItemPath)
  assertNonUndefined(lastSiblingItemPath)
  CurrentState.setAnchorItemPath(firstSiblingItemPath)
  CurrentState.setTargetItemPathOnly(lastSiblingItemPath)
  Rerenderer.instance.requestToFocusTargetItem()
}

export function setCaption(itemId: ItemId, caption: string) {
  switch (Internal.instance.state.items[itemId].type) {
    case ItemType.IMAGE:
      Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
        Internal.instance.mutate(caption, StatePath.of('imageItems', itemId, 'caption'))
      })
      break
    case ItemType.CODE_BLOCK:
      Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
        Internal.instance.mutate(caption, StatePath.of('codeBlockItems', itemId, 'caption'))
      })
      break
    case ItemType.TEX:
      Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
        Internal.instance.mutate(caption, StatePath.of('texItems', itemId, 'caption'))
      })
      break
  }
}

export function getCaption(itemId: ItemId): string | undefined {
  const state = Internal.instance.state
  switch (state.items[itemId].type) {
    case ItemType.IMAGE:
      return state.imageItems[itemId].caption
    case ItemType.CODE_BLOCK:
      return state.codeBlockItems[itemId].caption
    case ItemType.TEX:
      return state.texItems[itemId].caption
    default:
      return undefined
  }
}

export async function setupAllAlarms() {
  await chrome.alarms.clearAll()

  const reminderEntries = Object.entries(Internal.instance.state.reminders)
  // リマインダー機能を使っていない場合は通知権限を求めないようにここでreturnする
  if (reminderEntries.length === 0) return

  // 実際に通知するときに通知権限を求めるようでは遅い印象なので、アラームを設定する段階で求める
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  for (const [itemId, reminder] of reminderEntries) {
    const timestamp = calculateNextReminderTimestamp(reminder)
    if (timestamp !== undefined) {
      chrome.alarms.create(itemId, { when: timestamp })
    }
  }
}

/** 次に通知すべきタイムスタンプを計算する */
function calculateNextReminderTimestamp(reminder: Reminder): Timestamp | undefined {
  switch (reminder.type) {
    case 'once':
      const timestamp = dayjs()
        .year(reminder.year)
        .month(reminder.month)
        .date(reminder.date)
        .hour(reminder.hour)
        .minute(reminder.minute)
        .startOf('minute')
        .valueOf()
      if (reminder.notifiedAt === null || reminder.notifiedAt < timestamp) {
        return timestamp
      } else {
        return undefined
      }
    case 'every month': {
      const baseDate = call(() => {
        if (reminder.notifiedAt === null) {
          return dayjs()
        } else {
          return dayjs(reminder.notifiedAt)
        }
      })
      const date = baseDate
        .date(reminder.date)
        .hour(reminder.hour)
        .minute(reminder.minute)
        .startOf('minute')
      if (date.isBefore(dayjs())) {
        return date.add(1, 'month').valueOf()
      } else {
        return date.valueOf()
      }
    }
  }
}
