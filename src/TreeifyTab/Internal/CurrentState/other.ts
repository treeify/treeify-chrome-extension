import { ItemId, ItemType } from 'src/TreeifyTab/basicType'
import { getTextItemSelectionFromDom } from 'src/TreeifyTab/External/domTextSelection'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray$ } from 'src/Utility/fp-ts'

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
