import { assertNonNull } from 'src/Common/Debug/assert'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

export type CodeBlockLanguageSettingDialogProps = {
  language: string
  onKeyDown: (event: KeyboardEvent) => void
  onClickFinishButton: () => void
  onClickCancelButton: () => void
}

export function createCodeBlockLanguageSettingDialogProps(): CodeBlockLanguageSettingDialogProps {
  const itemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]

  function onClickFinishButton() {
    const languageElement = document.querySelector<HTMLInputElement>(
      '.language-setting-dialog_language'
    )
    assertNonNull(languageElement)
    CurrentState.setCodeBlockItemLanguage(itemId, languageElement.value)

    CurrentState.updateItemTimestamp(itemId)

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  return {
    language: codeBlockItem.language,
    onKeyDown(event) {
      if (event.isComposing) return

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
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}
