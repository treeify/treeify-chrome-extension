import {List} from 'immutable'
import {External} from 'src/TreeifyTab/External/External'
import {Command} from 'src/TreeifyTab/Internal/Command'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'

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
    title: 'エクスポート…',
    onClick: () => {
      External.instance.dialogState = {type: 'ExportDialog'}
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
