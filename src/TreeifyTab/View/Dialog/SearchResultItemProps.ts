import { ItemId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { CssCustomProperty } from 'src/Utility/browser'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { RArray, RSet$ } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'

export type SearchResultItemProps = {
  itemPath: ItemPath
  children: RArray<SearchResultItemProps>
  footprintRank: integer | undefined
  footprintCount: integer
  outerCircleSizeEm: integer
  isTranscluded: boolean
  cssClasses: RArray<string>
  onClick(event: MouseEvent): void
  onKeyDown(event: KeyboardEvent): void
}

export function createSearchResultItemPropses(
  itemPaths: RArray<ItemPath>
): RArray<SearchResultItemProps> {
  const firstItemPath = itemPaths[0]
  assertNonUndefined(firstItemPath)
  const pageId = ItemPath.getRootItemId(firstItemPath)

  const itemIdSet = RSet$.from(itemPaths.map(ItemPath.getItemId))
  const tree = CurrentState.treeify(RSet$.add(pageId)(itemIdSet), pageId, false)

  // 足跡を表示するためにタイムスタンプのランキングを計算する
  const items = Internal.instance.state.items
  const ranking = Array.from(itemIdSet).sort((a: ItemId, b: ItemId) => {
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
    return [rootItemProps]
  } else {
    return rootItemProps.children
  }

  // 足跡順位の計算結果にアクセスするためにクロージャーとして定義する
  function createSearchResultItemProps(
    itemPath: ItemPath,
    children: SearchResultItemProps[]
  ): SearchResultItemProps {
    const itemId = ItemPath.getItemId(itemPath)

    return {
      itemPath,
      children,
      footprintRank: footprintRankMap.get(itemId),
      footprintCount,
      outerCircleSizeEm: calculateOuterCircleSizeEm(itemId),
      isTranscluded: CurrentState.countParents(itemId) > 1,
      cssClasses: Internal.instance.state.items[itemId].cssClasses,
      onClick(event: MouseEvent) {
        const inputId = InputId.fromMouseEvent(event)
        if (inputId === '0000MouseButton0') {
          event.preventDefault()
          Internal.instance.saveCurrentStateToUndoStack()
          CurrentState.jumpTo(itemPath)
          CurrentState.updateItemTimestamp(itemId)

          // 検索ダイアログを閉じる
          External.instance.dialogState = undefined
          Rerenderer.instance.rerender()
        } else if (inputId === '0010MouseButton0') {
          event.preventDefault()
          transclude(itemPath)
        }
      },
      onKeyDown(event: KeyboardEvent) {
        switch (InputId.fromKeyboardEvent(event)) {
          case '0000Enter':
          case '0000Space':
            event.preventDefault()
            CurrentState.jumpTo(itemPath)
            CurrentState.updateItemTimestamp(itemId)

            // 検索ダイアログを閉じる
            External.instance.dialogState = undefined
            Rerenderer.instance.rerender()
            break
          case '0010Enter':
          case '0010Space':
            event.preventDefault()
            transclude(itemPath)
            break
        }
      },
    }
  }
}

function calculateOuterCircleSizeEm(itemId: ItemId): number {
  const childItemCount = Internal.instance.state.items[itemId].childItemIds.length
  if (childItemCount === 0) return 0

  const outerCircleMinSize = CssCustomProperty.getNumber('--bullet-outer-circle-min-size-em')
  assertNonUndefined(outerCircleMinSize)
  const outerCircleMaxSize = CssCustomProperty.getNumber('--bullet-outer-circle-max-size-em')
  assertNonUndefined(outerCircleMaxSize)
  const outerCircleChildCountLimit = CssCustomProperty.getNumber(
    '--bullet-outer-circle-child-count-limit'
  )
  assertNonUndefined(outerCircleChildCountLimit)
  const step = (outerCircleMaxSize - outerCircleMinSize) / outerCircleChildCountLimit
  const limitedHiddenItemsCount = Math.min(childItemCount, outerCircleChildCountLimit)
  return outerCircleMinSize + limitedHiddenItemsCount * step
}

function transclude(itemPath: ItemPath) {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  const itemId = ItemPath.getItemId(itemPath)
  CurrentState.throwIfCantInsertBelowItem(targetItemPath, itemId)

  const newItemPath = CurrentState.insertBelowItem(targetItemPath, itemId, {
    isFolded: true,
  })

  if (CurrentState.isEmptyTextItem(targetItemId)) {
    // 空のテキスト項目上で実行した場合は空のテキスト項目を削除する
    CurrentState.deleteItem(targetItemId)
  }

  CurrentState.updateItemTimestamp(ItemPath.getItemId(newItemPath))
  CurrentState.setTargetItemPath(newItemPath)
  Rerenderer.instance.requestToScrollAppear()

  // 検索ダイアログを閉じる
  External.instance.dialogState = undefined
  Rerenderer.instance.rerender()
}
