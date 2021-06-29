import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {TexEditDialog} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type TexEditDialogProps = {
  code: string
  onClickFinishButton: () => void
  onClickCancelButton: () => void
}

export function createTexEditDialogProps(dialog: TexEditDialog): TexEditDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  return {
    code: Internal.instance.state.texItems[ItemPath.getItemId(targetItemPath)].code,
    onClickFinishButton: () => {
      const targetItemId = ItemPath.getItemId(targetItemPath)

      // コードを更新
      const editBox = document.querySelector<HTMLDivElement>('.tex-edit-dialog_code')
      assertNonNull(editBox)
      CurrentState.setTexItemCode(targetItemId, editBox.textContent ?? '')

      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(targetItemId)

      // ダイアログを閉じる
      CurrentState.setDialog(null)
      Rerenderer.instance.rerender()
    },
    onClickCancelButton: () => {
      // ダイアログを閉じる
      CurrentState.setDialog(null)
      Rerenderer.instance.rerender()
    },
  }
}
