import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'

export type ImageItemEditDialogProps = {
  dialogTitle: string
  url: string
}

export function createImageItemEditDialogProps(): ImageItemEditDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const isEmptyImageItem = CurrentState.isEmptyImageItem(ItemPath.getItemId(targetItemPath))

  return {
    dialogTitle: isEmptyImageItem ? '画像項目作成' : '画像項目編集',
    url: Internal.instance.state.imageItems[ItemPath.getItemId(targetItemPath)].url,
  }
}
