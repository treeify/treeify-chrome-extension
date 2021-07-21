<script lang="ts">
  import katex from 'katex'
  import CommonDialog from './CommonDialog.svelte'
  import {TexEditDialogProps} from './TexEditDialogProps'

  export let props: TexEditDialogProps

  // リアルタイムプレビュー用の変数
  let currentCode = props.code

  function onInput(event: Event) {
    if (event.target instanceof HTMLElement) {
      currentCode = event.target.textContent ?? ''
    }
  }
</script>

<CommonDialog title={props.dialogTitle} onClose={props.onCloseDialog}>
  <div class="tex-edit-dialog_content" on:keydown={props.onKeyDown}>
    <div
      class="tex-edit-dialog_code"
      contenteditable="plaintext-only"
      tabindex="0"
      on:input={onInput}
    >
      {props.code}
    </div>
    <div class="tex-edit-dialog_rendered-tex">
      {@html katex.renderToString(currentCode, {throwOnError: false})}
    </div>
    <div class="tex-edit-dialog_button-area">
      <button on:click={props.onClickFinishButton}>完了</button>
      <button on:click={props.onClickCancelButton}>キャンセル</button>
    </div>
  </div>
</CommonDialog>

<style global>
  .tex-edit-dialog_content {
    min-width: 20em;
    padding: 1em;
  }

  .tex-edit-dialog_code {
    padding: 0.5em;

    /* lch(60.0%, 0.0, 0.0)相当 */
    outline: 1px solid #919191;
  }

  .tex-edit-dialog_rendered-tex {
    margin-top: 1em;
  }

  .tex-edit-dialog_button-area {
    /* ボタン群を右寄せにする */
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
