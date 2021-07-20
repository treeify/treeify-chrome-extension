import {List} from 'immutable'
import {assert} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {toOpmlString} from 'src/TreeifyTab/Internal/ImportExport/opml'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyTab/Internal/NullaryCommand'
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
      onClick: () => NullaryCommand.removeEdge(),
    })
  }

  if (CurrentState.countTabsInSubtree(Internal.instance.state, targetItemId) > 0) {
    result.push({
      title: 'タブを閉じる',
      onClick: () => NullaryCommand.hardUnloadSubtree(),
    })
  }

  if (CurrentState.countParents(targetItemId) >= 2 && isSingleSelect) {
    result.push({
      title: '他のトランスクルード元を表示…',
      onClick: () => NullaryCommand.showOtherParentsDialog(),
    })
  }

  result.push({
    title: 'トランスクルード用コピー',
    onClick: () => NullaryCommand.copyForTransclusion(),
  })

  result.push({
    title: 'Markdown形式でコピー',
    onClick: () => NullaryCommand.copyAsMarkdownText(),
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
      onClick: () => NullaryCommand.showCitationSettingDialog(),
    })
    if (item.cite?.title === '' && item.cite.url === '') {
      result.push({
        title: '出典を削除',
        onClick: () => NullaryCommand.toggleCitation(),
      })
    }
  }

  if (isSingleSelect) {
    if (CurrentState.getExcludedItemIds().contains(targetItemId)) {
      result.push({
        title: '現在のワークスペースからの除外を解除',
        onClick: () => NullaryCommand.toggleExcluded(),
      })
    } else {
      result.push({
        title: '現在のワークスペースのページツリーや検索結果から除外',
        onClick: () => NullaryCommand.toggleExcluded(),
      })
    }
  }

  return List(result)
}
