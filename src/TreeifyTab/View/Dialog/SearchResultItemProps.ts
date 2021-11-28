import { List } from 'immutable'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { assertNonUndefined } from 'src/Utility/Debug/assert'

export type SearchResultItemProps = {
  itemPath: ItemPath
  children: List<SearchResultItemProps>
  onClick: (event: MouseEvent) => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createSearchResultItemPropses(
  itemPaths: List<ItemPath>
): List<SearchResultItemProps> {
  const firstItemPath = itemPaths.first(undefined)
  assertNonUndefined(firstItemPath)
  const pageId = ItemPath.getRootItemId(firstItemPath)

  const itemIdSet = itemPaths.map(ItemPath.getItemId).toSet()
  const tree = CurrentState.treeify(itemIdSet.add(pageId), pageId)
  const rootItemProps = tree.fold(createSearchResultItemProps)
  if (itemIdSet.has(pageId)) {
    return List.of(rootItemProps)
  } else {
    return rootItemProps.children
  }
}

function createSearchResultItemProps(itemPath: ItemPath, children: SearchResultItemProps[]) {
  return {
    itemPath,
    children: List(children),
    onClick(event: MouseEvent) {
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
