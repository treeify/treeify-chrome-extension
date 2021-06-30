import {List} from 'immutable'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'

export type ContextMenuItemProps = {
  title: string
  onClick: () => void
}

export function createContextMenuItemPropses(): List<ContextMenuItemProps> {
  const result: ContextMenuItemProps[] = []

  result.push({
    title: 'ハードアンロード',
    onClick: () => NullaryCommand.hardUnloadSubtree(),
  })

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
