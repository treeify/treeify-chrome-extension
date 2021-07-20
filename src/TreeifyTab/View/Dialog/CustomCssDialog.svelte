<script lang="ts">
  import CommonDialog from './CommonDialog.svelte'
  import {CustomCssDialogProps} from './CustomCssDialogProps'

  export let props: CustomCssDialogProps
</script>

<CommonDialog title="カスタムCSS">
  <div class="custom-css-dialog_content">
    <div
      class="custom-css-dialog_code"
      contenteditable="plaintext-only"
      on:keydown={props.onKeyDown}
    />
    <div class="custom-css-dialog_button-area">
      <button on:click={props.onClickFinishButton}>完了</button>
      <button on:click={props.onClickCancelButton}>キャンセル</button>
    </div>
  </div>
</CommonDialog>

<style>
  .custom-css-dialog_content {
    padding: 1em;
  }

  .custom-css-dialog_code {
    min-width: 50vw;
    min-height: 50vh;
    padding: 0.5em;

    /* lch(60.0%, 0.0, 0.0)相当 */
    outline: 1px solid #919191;
  }

  .custom-css-dialog_button-area {
    /* ボタン群を右寄せにする */
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
