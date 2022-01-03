import dayjs from 'dayjs'
import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { getTextItemSelectionFromDom } from 'src/TreeifyTab/External/domTextSelection'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonUndefined } from 'src/Utility/Debug/assert'

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
    if (DomishObject.countCharacters(domishObjects) !== selectedCharCount) {
      document.execCommand('selectAll')
      return
    }
  }

  const parentItemId = ItemPath.getParentItemId(targetItemPath)
  if (parentItemId === undefined) return
  const siblingItemIds = Internal.instance.state.items[parentItemId].childItemIds
  const firstSiblingItemId: ItemId = siblingItemIds.first()
  const lastSiblingItemId: ItemId = siblingItemIds.last()
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
        Internal.instance.mutate(caption, PropertyPath.of('imageItems', itemId, 'caption'))
      })
      break
    case ItemType.CODE_BLOCK:
      Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
        Internal.instance.mutate(caption, PropertyPath.of('codeBlockItems', itemId, 'caption'))
      })
      break
    case ItemType.TEX:
      Internal.instance.searchEngine.updateSearchIndex(itemId, () => {
        Internal.instance.mutate(caption, PropertyPath.of('texItems', itemId, 'caption'))
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
  for (const [itemId, record] of Object.entries(Internal.instance.state.reminders)) {
    for (const [reminderId, reminderSetting] of Object.entries(record)) {
      switch (reminderSetting.type) {
        case 'once':
          const date = dayjs()
            .year(reminderSetting.year)
            .month(reminderSetting.month)
            .date(reminderSetting.date)
            .hour(reminderSetting.hour)
            .minute(reminderSetting.minute)
          chrome.alarms.create(`${itemId}@${reminderId}`, { when: date.valueOf() })
          break
      }
    }
  }
}
