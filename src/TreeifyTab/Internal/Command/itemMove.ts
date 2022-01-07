import { getTextItemSelectionFromDom } from 'src/TreeifyTab/External/domTextSelection'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { NERist, Rist } from 'src/Utility/fp-ts'

/** アウトライナーのいわゆるインデント操作を実行するコマンド。 */
export function indent() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()

  const prevSiblingItemPath = CurrentState.findPrevSiblingItemPath(selectedItemPaths[0])
  // 兄が居ない場合、何もしない
  if (prevSiblingItemPath === undefined) return

  const prevSiblingItemId = ItemPath.getItemId(prevSiblingItemPath)

  // 兄がページの場合は展開できないので何もしない
  if (CurrentState.isPage(prevSiblingItemId)) return

  // 兄を展開する
  CurrentState.setIsFolded(prevSiblingItemPath, false)

  const parentItemId = ItemPath.getParentItemId(prevSiblingItemPath)
  assertNonUndefined(parentItemId)
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    // 既存の親子関係を削除
    const edge = CurrentState.removeItemGraphEdge(parentItemId, selectedItemId)
    // 兄の最後の子になるようターゲット項目を配置
    CurrentState.insertLastChildItem(prevSiblingItemId, selectedItemId, edge)

    CurrentState.updateItemTimestamp(selectedItemId)
  }

  if (selectedItemPaths.length === 1) {
    // ターゲット項目を移動先に更新する
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    CurrentState.setTargetItemPath(prevSiblingItemPath.push(targetItemId))

    // キャレット位置、テキスト選択範囲を維持する
    Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
  } else {
    // 移動先を引き続き選択中にする
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    CurrentState.setTargetItemPathOnly(prevSiblingItemPath.push(targetItemId))
    const anchorItemId = ItemPath.getItemId(CurrentState.getAnchorItemPath())
    CurrentState.setAnchorItemPath(prevSiblingItemPath.push(anchorItemId))
    Rerenderer.instance.requestToFocusTargetItem()
  }
}

/** アウトライナーのいわゆるアンインデント操作を実行するコマンド。 */
export function unindent() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const parentItemPath = ItemPath.getParent(selectedItemPaths[0])

  // 親または親の親が居ない場合は何もしない
  if (parentItemPath === undefined) return
  if (!ItemPath.hasParent(parentItemPath)) return

  for (const selectedItemPath of Rist.reverse(selectedItemPaths)) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)

    // 既存の親子関係を削除
    const edge = CurrentState.removeItemGraphEdge(
      ItemPath.getItemId(parentItemPath),
      selectedItemId
    )
    // 親の弟として配置する
    CurrentState.insertNextSiblingItem(parentItemPath, selectedItemId, edge)

    CurrentState.updateItemTimestamp(selectedItemId)
  }

  if (selectedItemPaths.length === 1) {
    // ターゲット項目を移動先に更新する
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    const siblingItemPath = ItemPath.createSiblingItemPath(parentItemPath, targetItemId)!
    CurrentState.setTargetItemPath(siblingItemPath)

    // キャレット位置、テキスト選択範囲を維持する
    Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
  } else {
    // 移動先を引き続き選択中にする
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    CurrentState.setTargetItemPathOnly(
      ItemPath.createSiblingItemPath(parentItemPath, targetItemId)!
    )
    const anchorItemId = ItemPath.getItemId(CurrentState.getAnchorItemPath())
    CurrentState.setAnchorItemPath(ItemPath.createSiblingItemPath(parentItemPath, anchorItemId)!)
    Rerenderer.instance.requestToFocusTargetItem()
  }
}

/**
 * 項目をドキュメント順で1つ上に移動するコマンド。
 * 親が居ない場合など、そのような移動ができない場合は何もしない。
 */
export function moveItemToAbove() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemParentItemId = ItemPath.getParentItemId(targetItemPath)

  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const aboveItemPath = CurrentState.findAboveItemPath(selectedItemPaths[0])
  // 1つ上の項目が存在しない場合は何もしない
  if (aboveItemPath === undefined) return

  const aboveItemParentItemId = ItemPath.getParentItemId(aboveItemPath)
  // 1つ上の項目がアクティブページである場合も何もしない
  if (aboveItemParentItemId === undefined) return

  // 1つ上の項目の上に項目を移動する
  for (const selectedItemPath of selectedItemPaths) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    // 既存の親子関係を削除
    const edge = CurrentState.removeItemGraphEdge(targetItemParentItemId!, selectedItemId)
    // 1つ上の項目の兄になるようターゲット項目を配置
    CurrentState.insertPrevSiblingItem(aboveItemPath, selectedItemId, edge)

    CurrentState.updateItemTimestamp(selectedItemId)
  }

  // ターゲットItemPathを更新
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const newTargetItemPath = ItemPath.createSiblingItemPath(aboveItemPath, targetItemId)
  assertNonUndefined(newTargetItemPath)
  CurrentState.setTargetItemPathOnly(newTargetItemPath)
  // アンカーItemPathを更新
  const newAnchorItemPath = ItemPath.createSiblingItemPath(
    aboveItemPath,
    ItemPath.getItemId(CurrentState.getAnchorItemPath())
  )
  assertNonUndefined(newAnchorItemPath)
  CurrentState.setAnchorItemPath(newAnchorItemPath)

  // キャレット位置、テキスト選択範囲を維持する
  Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
}

/**
 * ドキュメント順で項目を1つ下に移動するコマンド。
 * すでに下端の場合など、そのような移動ができない場合は何もしない。
 */
export function moveItemToBelow() {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const targetItemParentItemId = ItemPath.getParentItemId(targetItemPath)

  const selectedItemPaths = CurrentState.getSelectedItemPaths()

  // 「弟、または親の弟、または親の親の弟、または…」に該当する項目を探索する
  const firstFollowingItemPath = CurrentState.findFirstFollowingItemPath(
    NERist.last(selectedItemPaths)
  )
  // 該当項目がない場合（メインエリアの下端の場合）は何もしない
  if (firstFollowingItemPath === undefined) return

  // 1つ下の項目の下に項目を移動する
  for (const selectedItemPath of Rist.reverse(selectedItemPaths)) {
    const selectedItemId = ItemPath.getItemId(selectedItemPath)
    // 既存の親子関係を削除
    const edge = CurrentState.removeItemGraphEdge(targetItemParentItemId!, selectedItemId)
    // 項目を再配置
    CurrentState.insertBelowItem(firstFollowingItemPath, selectedItemId, edge)

    CurrentState.updateItemTimestamp(selectedItemId)
  }

  if (CurrentState.getDisplayingChildItemIds(firstFollowingItemPath).isEmpty()) {
    // 1つ下の項目が子を表示していない場合

    // ターゲットItemPathを更新
    const newTargetItemPath = ItemPath.createSiblingItemPath(firstFollowingItemPath, targetItemId)
    assertNonUndefined(newTargetItemPath)
    CurrentState.setTargetItemPathOnly(newTargetItemPath)

    // アンカーItemPathを更新
    const newAnchorItemPath = ItemPath.createSiblingItemPath(
      firstFollowingItemPath,
      ItemPath.getItemId(CurrentState.getAnchorItemPath())
    )
    assertNonUndefined(newAnchorItemPath)
    CurrentState.setAnchorItemPath(newAnchorItemPath)
    Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
  } else {
    // 1つ下の項目が子を表示している場合

    // ターゲットItemPathを更新
    const newTargetItemPath = firstFollowingItemPath.push(targetItemId)
    CurrentState.setTargetItemPathOnly(newTargetItemPath)
    // アンカーItemPathを更新
    const newAnchorItemPath = firstFollowingItemPath.push(
      ItemPath.getItemId(CurrentState.getAnchorItemPath())
    )
    CurrentState.setAnchorItemPath(newAnchorItemPath)
    Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
  }
}

/** 兄弟指向で項目を上に移動するコマンド */
export function moveItemToPrevSibling() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const prevSiblingItemPath = CurrentState.findPrevSiblingItemPath(selectedItemPaths[0])
  if (prevSiblingItemPath !== undefined) {
    const targetItemParentItemId = ItemPath.getParentItemId(selectedItemPaths[0])
    // 兄が居るということは親が居るということ
    assertNonUndefined(targetItemParentItemId)

    for (const selectedItemPath of selectedItemPaths) {
      const selectedItemId = ItemPath.getItemId(selectedItemPath)
      // 既存の親子関係を削除
      const edge = CurrentState.removeItemGraphEdge(targetItemParentItemId, selectedItemId)
      // 兄の上に配置
      CurrentState.insertPrevSiblingItem(prevSiblingItemPath, selectedItemId, edge)

      CurrentState.updateItemTimestamp(selectedItemId)
    }

    // 兄弟リスト内での移動なのでfocusItemPathやanchorItemPathの更新は不要

    // キャレット位置、テキスト選択範囲を維持する
    Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
  } else {
    // 次のようなツリーの中でDを上に動かす際、Aの弟ではなくBの弟にする。
    // A
    //   B
    // C
    //   D
    const aboveItemPath = CurrentState.findAboveItemPath(selectedItemPaths[0])
    if (aboveItemPath !== undefined) {
      const knightItemPath = CurrentState.findPrevSiblingItemPath(aboveItemPath)
      if (knightItemPath !== undefined) {
        if (!CurrentState.getDisplayingChildItemIds(knightItemPath).isEmpty()) {
          const oldParentItemId = ItemPath.getItemId(aboveItemPath)
          const newParentItemId = ItemPath.getItemId(knightItemPath)

          for (const selectedItemPath of selectedItemPaths) {
            const selectedItemId = ItemPath.getItemId(selectedItemPath)
            // 既存の親子関係を削除
            const edge = CurrentState.removeItemGraphEdge(oldParentItemId, selectedItemId)
            // 兄の上に配置
            CurrentState.insertLastChildItem(newParentItemId, selectedItemId, edge)

            CurrentState.updateItemTimestamp(selectedItemId)
          }

          // focusItemPathとanchorItemPathを更新
          const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
          CurrentState.setTargetItemPathOnly(knightItemPath.push(targetItemId))
          const anchorItemId = ItemPath.getItemId(CurrentState.getAnchorItemPath())
          CurrentState.setAnchorItemPath(knightItemPath.push(anchorItemId))

          // キャレット位置、テキスト選択範囲を維持する
          Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
          return
        }
      }
    }

    moveItemToAbove()
  }
}

/** 兄弟指向で項目を下に移動するコマンド */
export function moveItemToNextSibling() {
  const selectedItemPaths = CurrentState.getSelectedItemPaths()
  const nextSiblingItemPath = CurrentState.findNextSiblingItemPath(NERist.last(selectedItemPaths))
  if (nextSiblingItemPath !== undefined) {
    const targetItemParentItemId = ItemPath.getParentItemId(selectedItemPaths[0])
    // 兄が居るということは親が居るということ
    assertNonUndefined(targetItemParentItemId)

    for (const selectedItemPath of Rist.reverse(selectedItemPaths)) {
      const selectedItemId = ItemPath.getItemId(selectedItemPath)
      // 既存の親子関係を削除
      const edge = CurrentState.removeItemGraphEdge(targetItemParentItemId, selectedItemId)
      // 弟の下に配置
      CurrentState.insertNextSiblingItem(nextSiblingItemPath, selectedItemId, edge)

      CurrentState.updateItemTimestamp(selectedItemId)
    }

    // 兄弟リスト内での移動なのでfocusItemPathやanchorItemPathの更新は不要

    // キャレット位置、テキスト選択範囲を維持する
    Rerenderer.instance.requestToFocusTargetItem(getTextItemSelectionFromDom())
  } else {
    moveItemToBelow()
  }
}
