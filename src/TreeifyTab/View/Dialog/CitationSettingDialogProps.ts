import {assertNonNull} from 'src/Common/Debug/assert'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {CitationSettingDialog} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type CitationSettingDialogProps = {
  title: string
  url: string
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
    const citeTitleElement = document.querySelector<HTMLInputElement>(
      '.citation-setting-dialog_cite-title'
    )
    const citeUrlElement = document.querySelector<HTMLInputElement>(
      '.citation-setting-dialog_cite-url'
    )
    assertNonNull(citeTitleElement)
    assertNonNull(citeUrlElement)
    CurrentState.setCite(targetItemId, {
      title: citeTitleElement.value,
      url: citeUrlElement.value,
    })

    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(targetItemId)

    // ダイアログを閉じる
    CurrentState.setDialog(null)
    Rerenderer.instance.rerender()
  }

  return {
    title: item.cite?.title ?? '',
    url: item.cite?.url ?? '',
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
