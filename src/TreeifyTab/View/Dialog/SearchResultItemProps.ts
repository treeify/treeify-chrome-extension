import {is, List} from 'immutable'
import {assertNonNull} from 'src/Common/Debug/assert'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {MainAreaContentView} from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import {tick} from 'svelte'

export type SearchResultItemProps = {
  itemPath: ItemPath
  children: List<SearchResultItemProps>
  onClick: () => void
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

  function onClick() {
    doWithErrorCapture(() => {
      const containerPageId = ItemPath.getRootItemId(itemPath)

      // ジャンプ先のページのtargetItemPathを更新する
      Internal.instance.mutate(
        itemPath,
        PropertyPath.of('pages', containerPageId, 'targetItemPath')
      )
      Internal.instance.mutate(
        itemPath,
        PropertyPath.of('pages', containerPageId, 'anchorItemPath')
      )

      CurrentState.moses(itemPath)

      // ページを切り替える
      CurrentState.switchActivePage(containerPageId)

      // 再描画完了後に対象アイテムに自動スクロールする
      tick().then(() => {
        const targetElementId = MainAreaContentView.focusableDomElementId(itemPath)
        const focusableElement = document.getElementById(targetElementId)
        assertNonNull(focusableElement)
        focusableElement.scrollIntoView({
          behavior: 'auto',
          block: 'center',
          inline: 'center',
        })
      })

      // 検索ダイアログを閉じる
      CurrentState.setDialog(null)
      Rerenderer.instance.rerender()
    })
  }

  function onKeyDown(event: KeyboardEvent) {
    const inputId = InputId.fromKeyboardEvent(event)
    switch (inputId) {
      case '0000ArrowDown':
      case '0000ArrowUp':
        event.preventDefault()

        const focusableElements = List(
          document.querySelectorAll(
            '.search-dialog_content input, .search-dialog_content [tabindex]'
          )
        ) as List<HTMLElement>
        const index = focusableElements.findIndex((element) => document.activeElement === element)
        if (index === -1) return

        if (inputId === '0000ArrowDown') {
          // フォーカスを次の要素に移す
          const nextIndex = (index + 1) % focusableElements.size
          focusableElements.get(nextIndex)!.focus()
        } else {
          // フォーカスを前の要素に移す
          const prevIndex = (index - 1) % focusableElements.size
          focusableElements.get(prevIndex)!.focus()
        }
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
