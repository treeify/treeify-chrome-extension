import { List } from 'immutable'
import { ItemId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { CssCustomProperty } from 'src/Utility/browser'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { integer } from 'src/Utility/integer'

export type SearchResultItemProps = {
  itemPath: ItemPath
  children: List<SearchResultItemProps>
  footprintRank: integer | undefined
  footprintCount: integer
  onClick(event: MouseEvent): void
  onKeyDown(event: KeyboardEvent): void
}

export function createSearchResultItemPropses(
  itemPaths: List<ItemPath>
): List<SearchResultItemProps> {
  const firstItemPath = itemPaths.first(undefined)
  assertNonUndefined(firstItemPath)
  const pageId = ItemPath.getRootItemId(firstItemPath)

  const itemIdSet = itemPaths.map(ItemPath.getItemId).toSet()
  const tree = CurrentState.treeify(itemIdSet.add(pageId), pageId)

  // 足跡を表示するためにタイムスタンプのランキングを計算する
  const items = Internal.instance.state.items
  const ranking = itemIdSet.toArray().sort((a: ItemId, b: ItemId) => {
    return items[b].timestamp - items[a].timestamp
  })
  const exponent = CssCustomProperty.getNumber('--search-result-footprint-count-exponent') ?? 0.5
  const footprintCount = Math.floor(itemIdSet.size ** exponent)
  // 各項目に足跡順位を対応付け
  const footprintRankMap = new Map<ItemId, integer>()
  for (let i = 0; i < footprintCount; i++) {
    footprintRankMap.set(ranking[i], i)
  }

  const rootItemProps = tree.fold(createSearchResultItemProps)
  if (itemIdSet.has(pageId)) {
    return List.of(rootItemProps)
  } else {
    return rootItemProps.children
  }

  // 足跡順位の計算結果にアクセスするためにクロージャーとして定義する
  function createSearchResultItemProps(itemPath: ItemPath, children: SearchResultItemProps[]) {
    const footprintRank = footprintRankMap.get(ItemPath.getItemId(itemPath))
    return {
      itemPath,
      children: List(children),
      footprintRank,
      footprintCount,
      onClick(event: MouseEvent) {
        // 横スクロールバーをクリックした場合は何もしないようにする
        if (event.target instanceof HTMLElement) {
          const rect = event.target.getBoundingClientRect()
          if (event.target.offsetHeight - event.target.clientHeight > rect.bottom - event.clientY) {
            return
          }
        }

        const inputId = InputId.fromMouseEvent(event)
        if (inputId === '0000MouseButton0') {
          event.preventDefault()
          CurrentState.jumpTo(itemPath)
          CurrentState.updateItemTimestamp(ItemPath.getItemId(itemPath))

          // 検索ダイアログを閉じる
          External.instance.dialogState = undefined
          Rerenderer.instance.rerender()
        } else if (inputId === '0010MouseButton0') {
          event.preventDefault()
          transclude(itemPath)
          CurrentState.updateItemTimestamp(ItemPath.getItemId(itemPath))

          // 検索ダイアログを閉じる
          External.instance.dialogState = undefined
          Rerenderer.instance.rerender()
        }
      },
      onKeyDown(event: KeyboardEvent) {
        switch (InputId.fromKeyboardEvent(event)) {
          case '0000Enter':
          case '0000Space':
            event.preventDefault()
            CurrentState.jumpTo(itemPath)
            CurrentState.updateItemTimestamp(ItemPath.getItemId(itemPath))

            // 検索ダイアログを閉じる
            External.instance.dialogState = undefined
            Rerenderer.instance.rerender()
            break
          case '0010Enter':
          case '0010Space':
            event.preventDefault()
            transclude(itemPath)
            CurrentState.updateItemTimestamp(ItemPath.getItemId(itemPath))

            // 検索ダイアログを閉じる
            External.instance.dialogState = undefined
            Rerenderer.instance.rerender()
            break
        }
      },
    }
  }
}

function transclude(itemPath: ItemPath) {
  // TODO: トランスクルード時の親子関係、エッジ不整合対策
  const newItemPath = CurrentState.insertBelowItem(
    CurrentState.getTargetItemPath(),
    ItemPath.getItemId(itemPath),
    { isFolded: true }
  )
  CurrentState.updateItemTimestamp(ItemPath.getItemId(newItemPath))
  CurrentState.setTargetItemPath(newItemPath)
}
