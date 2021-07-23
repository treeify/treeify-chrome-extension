import {List} from 'immutable'
import {assert} from 'src/Common/Debug/assert'
import {Command} from 'src/TreeifyTab/Internal/Command'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {toMarkdownText} from 'src/TreeifyTab/Internal/ImportExport/markdown'
import {toOpmlString} from 'src/TreeifyTab/Internal/ImportExport/opml'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'

export type ContextMenuItemProps = {
  title: string
  onClick: () => void
}

export function createContextMenuItemPropses(): List<ContextMenuItemProps> {
  const isSingleSelect = CurrentState.getSelectedItemPaths().size === 1
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  const item = Internal.instance.state.items[targetItemId]

  const result: ContextMenuItemProps[] = []

  if (ItemPath.hasParent(targetItemPath)) {
    result.push({
      title: '削除',
      onClick: () => Command.removeEdge(),
    })
  }

  if (CurrentState.countTabsInSubtree(Internal.instance.state, targetItemId) > 0) {
    result.push({
      title: 'タブを閉じる',
      onClick: () => Command.hardUnloadSubtree(),
    })
  }

  if (CurrentState.countParents(targetItemId) >= 2 && isSingleSelect) {
    result.push({
      title: '他のトランスクルード元を表示…',
      onClick: () => Command.showOtherParentsDialog(),
    })
  }

  result.push({
    title: 'トランスクルード用コピー',
    onClick: () => Command.copyForTransclusion(),
  })

  result.push({
    title: 'Markdown形式でコピー',
    onClick: () => {
      // TODO: 複数選択時はそれらをまとめてMarkdown化する
      const targetItemPath1 = CurrentState.getTargetItemPath()
      const blob = new Blob([toMarkdownText(targetItemPath1)], {type: 'text/plain'})
      navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
    },
  })

  result.push({
    title: 'OPML形式でエクスポート',
    onClick: () => {
      const fileName = 'treeify.opml'

      const content = toOpmlString(CurrentState.getSelectedItemPaths())
      const aElement = document.createElement('a')
      aElement.href = window.URL.createObjectURL(new Blob([content], {type: 'application/xml'}))
      aElement.download = fileName
      aElement.click()

      assert(State.isValid(Internal.instance.state))
    },
  })

  if (isSingleSelect) {
    result.push({
      title: '出典を設定…',
      onClick: () => Command.showCitationSettingDialog(),
    })
    if (item.cite?.title === '' && item.cite.url === '') {
      result.push({
        title: '出典を削除',
        onClick: () => Command.toggleCitation(),
      })
    }
  }

  if (isSingleSelect) {
    if (CurrentState.getExcludedItemIds().contains(targetItemId)) {
      result.push({
        title: '現在のワークスペースからの除外を解除',
        onClick: () => Command.toggleExcluded(),
      })
    } else {
      result.push({
        title: '現在のワークスペースのページツリーや検索結果から除外',
        onClick: () => Command.toggleExcluded(),
      })
    }
  }

  return List(result)
}
