<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { detectLanguage } from 'src/TreeifyTab/highlightJs'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { removeRedundantIndent } from 'src/TreeifyTab/Internal/ImportExport/indentedText'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'
  import { assertNonNull } from 'src/Utility/Debug/assert'

  const targetItemPath = CurrentState.getTargetItemPath()
  const isEmptyCodeBlockItem = CurrentState.isEmptyCodeBlockItem(ItemPath.getItemId(targetItemPath))

  const dialogTitle = isEmptyCodeBlockItem ? 'コードブロック項目作成' : 'コードブロック編集'
  const code = Internal.instance.state.codeBlockItems[ItemPath.getItemId(targetItemPath)].code

  function onClickFinishButton() {
    const targetItemId = ItemPath.getItemId(targetItemPath)

    const editBox = document.querySelector<HTMLDivElement>('.code-block-edit-dialog_code')
    assertNonNull(editBox)
    const code = editBox.textContent?.replace(/\r?\n$/, '') ?? ''

    if (code !== '') {
      // コードが空でない場合

      // コードを更新
      CurrentState.setCodeBlockItemCode(targetItemId, code)
      // 言語を自動検出
      CurrentState.setCodeBlockItemLanguage(targetItemId, detectLanguage(code))
      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(targetItemId)
    } else {
      // コードが空の場合

      // コードブロック項目を削除
      Command.removeEdge()
    }

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onPaste(event: ClipboardEvent) {
    if (event.clipboardData !== null) {
      event.preventDefault()

      // 無駄なインデントを自動的に除去する
      const text = removeRedundantIndent(event.clipboardData.getData('text/plain'))

      // 改行を含むテキストをそのままdocument.execCommand('insertText', false, text)としても
      // うまくいかないので改行をbr要素にする
      const lines = text.split(/\r?\n/)
      for (let i = 0; i < lines.length; i++) {
        document.execCommand('insertText', false, lines[i])
        if (i !== lines.length - 1) {
          document.execCommand('insertLineBreak')
        }
      }
    }
  }

  function onClickCancelButton() {
    // ダイアログを閉じる
    External.instance.dialogState = undefined
    onCloseDialog()
    Rerenderer.instance.rerender()
  }

  function onKeyDown(event) {
    switch (InputId.fromKeyboardEvent(event)) {
      case '1000Enter':
        onClickFinishButton()
        break
    }
  }

  function onCloseDialog() {
    if (CurrentState.isEmptyCodeBlockItem(ItemPath.getItemId(CurrentState.getTargetItemPath()))) {
      Command.removeEdge()
    }
  }
</script>

<CommonDialog title={dialogTitle} onClose={onCloseDialog}>
  <div class="code-block-edit-dialog_content" on:keydown={onKeyDown}>
    <div
      class="code-block-edit-dialog_code"
      contenteditable="plaintext-only"
      tabindex="0"
      on:paste={onPaste}
    >
      {code}
    </div>
    <div class="code-block-edit-dialog_button-area">
      <FinishAndCancelButtons {onClickFinishButton} {onClickCancelButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .code-block-edit-dialog_content {
    min-width: 30em;
    padding: 1em;

    max-height: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .code-block-edit-dialog_code {
    min-height: 5em;
    padding: 0.5em;

    // lch(60.0%, 0.0, 0.0)相当
    outline: 1px solid #919191;

    max-height: 100%;
    overflow-y: auto;
  }

  .code-block-edit-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
