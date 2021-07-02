import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {CitationSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'

export type CitationSettingDialogProps = {
  cite: string
  citeUrl: string
  onKeyDown: (event: KeyboardEvent) => void
  onClickFinishButton: () => void
  onClickCancelButton: () => void
}

export function createCitationSettingDialogProps(
  dialog: CitationSettingDialog
): CitationSettingDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const item = Internal.instance.state.items[ItemPath.getItemId(targetItemPath)]
  const onClickFinishButton = () => {
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
  }

  return {
    cite: item.cite,
    citeUrl: item.citeUrl,
    onKeyDown: (event) => {
      switch (InputId.fromKeyboardEvent(event)) {
        case '0000Enter':
        case '1000Enter':
          onClickFinishButton()
          break
      }
    },
    onClickFinishButton,
    onClickCancelButton: () => {
      // ダイアログを閉じる
      CurrentState.setDialog(null)
      Rerenderer.instance.rerender()
    },
  }
}
