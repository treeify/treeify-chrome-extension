import {is, List} from 'immutable'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type SearchResultItemProps = {
  itemPath: ItemPath
  children: List<SearchResultItemProps>
  onClick: (event: MouseEvent) => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function createSearchResultItemPropses(
  itemPaths: List<ItemPath>
): List<SearchResultItemProps> {
  const sortedItemPaths = CurrentState.sortByDocumentOrder(itemPaths)

  const topItemPath = sortedItemPaths.first(undefined)
  if (topItemPath === undefined) return List.of()

  const rootItemPaths = [topItemPath]
  const map = new Map<string, List<ItemPath>>()
  for (let i = 1; i < sortedItemPaths.size; i++) {
    const itemPath = sortedItemPaths.get(i)!

    for (let j = i - 1; ; j--) {
      if (j < 0) {
        rootItemPaths.push(itemPath)
        break
      }

      const candidateItemPath = sortedItemPaths.get(j)!
      // candidateItemPathがitemPathのprefixの場合
      if (is(itemPath.take(candidateItemPath.size), candidateItemPath)) {
        const key = JSON.stringify(candidateItemPath.toArray())
        map.set(key, (map.get(key) ?? List.of()).push(itemPath))
        break
      }
    }
  }

  return List(rootItemPaths).map((rootItemPath) => createSearchResultItemProps(rootItemPath, map))
}

function createSearchResultItemProps(
  itemPath: ItemPath,
  map: Map<string, List<ItemPath>>
): SearchResultItemProps {
  const key = JSON.stringify(itemPath.toArray())
  const childItemPaths = map.get(key) ?? List.of()

  function onClick(event: MouseEvent) {
    doWithErrorCapture(() => {
      const inputId = InputId.fromMouseEvent(event)
      if (inputId === '0000MouseButton0') {
        CurrentState.jumpTo(itemPath)

        // 検索ダイアログを閉じる
        External.instance.dialogState = undefined
        Rerenderer.instance.rerender()
      } else if (inputId === '0010MouseButton0') {
        transclude(itemPath)
      }
    })
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (InputId.fromKeyboardEvent(event)) {
      case '0000Enter':
      case '0000Space':
        event.preventDefault()
        CurrentState.jumpTo(itemPath)

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
  }

  return {
    itemPath,
    children: childItemPaths.map((childItemPath) =>
      createSearchResultItemProps(childItemPath, map)
    ),
    onClick,
    onKeyDown,
  }
}

function transclude(itemPath: ItemPath) {
  // TODO: トランスクルード時の親子関係、エッジ不整合対策
  const newItemPath = CurrentState.insertBelowItem(
    CurrentState.getTargetItemPath(),
    ItemPath.getItemId(itemPath),
    {isCollapsed: true}
  )
  CurrentState.updateItemTimestamp(ItemPath.getItemId(newItemPath))
  CurrentState.setTargetItemPath(newItemPath)

  // 検索ダイアログを閉じる
  External.instance.dialogState = undefined
  Rerenderer.instance.rerender()
}
