import {List} from 'immutable'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'

export type ContextMenuItemProps = {
  title: string
  onClick: () => void
}

export function createContextMenuItemPropses(): List<ContextMenuItemProps> {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  const result: ContextMenuItemProps[] = []

  if (CurrentState.countTabsInSubtree(Internal.instance.state, targetItemId) > 0) {
    result.push({
      title: 'タブを閉じる',
      onClick: () => NullaryCommand.hardUnloadSubtree(),
    })
  }

  result.push({
    title: 'トランスクルード用コピー',
    onClick: () => NullaryCommand.copyForTransclusion(),
  })

  result.push({
    title: '出典を設定…',
    onClick: () => NullaryCommand.showCitationSettingDialog(),
  })
  result.push({
    title: 'ラベルを編集…',
    onClick: () => NullaryCommand.showLabelEditDialog(),
  })

  return List(result)
}
