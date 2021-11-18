<script lang="ts">
  import { removeRedundantIndent } from '../../Internal/ImportExport/indentedText'
  import { CodeBlockItemEditDialogProps } from './CodeBlockItemEditDialogProps'
  import CommonDialog from './CommonDialog.svelte'
  import FinishAndCancelButtons from './FinishAndCancelButtons.svelte'

  export let props: CodeBlockItemEditDialogProps

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
</script>

<CommonDialog title={props.dialogTitle} onClose={props.onCloseDialog}>
  <div class="code-block-edit-dialog_content" on:keydown={props.onKeyDown}>
    <div
      class="code-block-edit-dialog_code"
      contenteditable="plaintext-only"
      tabindex="0"
      on:paste={onPaste}
    >
      {props.code}
    </div>
    <div class="code-block-edit-dialog_button-area">
      <FinishAndCancelButtons
        onClickFinishButton={props.onClickFinishButton}
        onClickCancelButton={props.onClickCancelButton}
      />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .code-block-edit-dialog_content {
    min-width: 30em;
    padding: 1em;
  }

  .code-block-edit-dialog_code {
    min-height: 5em;
    padding: 0.5em;

    // lch(60.0%, 0.0, 0.0)相当
    outline: 1px solid #919191;
  }

  .code-block-edit-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
