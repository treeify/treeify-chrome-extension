<script lang="ts">
  import {CurrentState} from '../../Internal/CurrentState'
  import {Rerenderer} from '../../Rerenderer'
  import CommonDialog from './CommonDialog.svelte'
  import {TexEditDialogProps} from './TexEditDialogProps'

  export let props: TexEditDialogProps

  const onCloseDialog = () => {
    // ダイアログを閉じる
    CurrentState.setTexEditDialog(null)
    Rerenderer.instance.rerender()
  }
</script>

<CommonDialog title="TeX編集" {onCloseDialog}>
  <div class="tex-edit-dialog_content">
    <div class="tex-edit-dialog_code" contenteditable="plaintext-only" tabindex="0">
      {props.code}
    </div>
    <div class="tex-edit-dialog_button-area">
      <button on:click={props.onClickFinishButton}>完了</button>
      <button on:click={props.onClickCancelButton}>キャンセル</button>
    </div>
  </div>
</CommonDialog>

<style>
  .tex-edit-dialog_content {
    padding: 1em;
  }

  .tex-edit-dialog_code {
    padding: 0.5em;

    outline: 1px solid hsl(0, 0%, 60%);
  }

  .tex-edit-dialog_button-area {
    /* ボタン群を右寄せにする */
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
