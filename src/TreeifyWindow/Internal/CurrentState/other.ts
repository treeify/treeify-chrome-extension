import {is} from 'immutable'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState/index'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {get} from 'src/TreeifyWindow/svelte'

/**
 * CurrentStateへの全ての変更を確定し、ModelのStateを書き換える。
 * さらにそれをViewに通知する。
 */
export function commit() {
  Internal.instance.commit()
}

/**
 * 指定されたアイテムが選択されているかどうかを返す。
 * 単一選択でも複数選択でも動作する。
 */
export function isSelected(itemPath: ItemPath): boolean {
  const targetItemPath = CurrentState.getTargetItemPath()
  const anchorItemPath = CurrentState.getAnchorItemPath()

  const parentItemId = ItemPath.getParentItemId(itemPath)
  if (parentItemId === undefined) {
    // itemPathがアクティブページの場合、複数選択は考慮しなくていいのでtargetItemPathと比較するだけでOK
    return is(targetItemPath, itemPath)
  }

  if (!is(itemPath.pop(), targetItemPath.pop())) {
    // 選択されたアイテムパス群がこのアイテムパスと異なる子リスト上に存在する場合
    return false
  }

  const targetItemId = ItemPath.getItemId(targetItemPath)
  const anchorItemId = ItemPath.getItemId(anchorItemPath)

  // （ここで他のStoreを参照しているが、複数選択中に子リストが変化することは無いと仮定していい）
  const childItemIds = get(Internal.instance.state.items[parentItemId].childItemIds)
  const targetItemIndex = childItemIds.indexOf(targetItemId)
  const anchorItemIndex = childItemIds.indexOf(anchorItemId)
  const itemIndex = childItemIds.indexOf(ItemPath.getItemId(itemPath))
  const minIndex = Math.min(targetItemIndex, anchorItemIndex)
  const maxIndex = Math.max(targetItemIndex, anchorItemIndex)
  return minIndex <= itemIndex && itemIndex <= maxIndex
}

/** アイテムを複数選択中かどうかを返す */
export function isMultiSelected(): boolean {
  const targetItemPath = CurrentState.getTargetItemPath()
  const anchorItemPath = CurrentState.getAnchorItemPath()
  return !is(targetItemPath, anchorItemPath)
}
