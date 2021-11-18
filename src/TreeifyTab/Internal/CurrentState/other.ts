import { assertNonUndefined } from 'src/Common/Debug/assert'
import { ItemId } from 'src/TreeifyTab/basicType'
import { getTextItemSelectionFromDom } from 'src/TreeifyTab/External/domTextSelection'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState/index'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'

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
}
