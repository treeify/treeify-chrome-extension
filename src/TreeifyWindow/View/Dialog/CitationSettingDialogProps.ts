import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type CitationSettingDialogProps = {
  cite: string
  citeUrl: string
  onClickFinishButton: () => void
  onClickCancelButton: () => void
}

export function createCitationSettingDialogProps(
  state: State
): CitationSettingDialogProps | undefined {
  if (state.dialog?.type !== 'CitationSettingDialog') return undefined

  const targetItemPath = CurrentState.getTargetItemPath()
  const item = state.items[ItemPath.getItemId(targetItemPath)]
  return {
    cite: item.cite,
    citeUrl: item.citeUrl,
    onClickFinishButton: () => {
      const targetItemId = ItemPath.getItemId(targetItemPath)

      // citeプロパティを更新
      const citeElement = document.querySelector<HTMLInputElement>('.citation-setting-dialog_cite')
      assertNonNull(citeElement)
      CurrentState.setCite(targetItemId, citeElement.value)

      // citeUrlプロパティを更新
      const citeUrlElement = document.querySelector<HTMLInputElement>(
        '.citation-setting-dialog_cite-url'
      )
      assertNonNull(citeUrlElement)
      CurrentState.setCiteUrl(targetItemId, citeUrlElement.value)

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
