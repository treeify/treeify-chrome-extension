<script lang="ts">
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'
  import { ImageItemEditDialogProps } from 'src/TreeifyTab/View/Dialog/ImageItemEditDialogProps'

  export let props: ImageItemEditDialogProps
</script>

<CommonDialog title={props.dialogTitle} onClose={props.onCloseDialog}>
  <div class="image-item-edit-dialog_content" on:keydown={props.onKeyDown}>
    <input
      type="text"
      class="image-item-edit-dialog_url"
      value={props.url}
      placeholder="https://example.com/image.png"
    />
    <div class="image-item-edit-dialog_button-area">
      <FinishAndCancelButtons
        onClickFinishButton={props.onClickFinishButton}
        onClickCancelButton={props.onClickCancelButton}
      />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .image-item-edit-dialog_content {
    min-width: 60em;
    padding: 1em;
  }

  .image-item-edit-dialog_url {
    width: 100%;
  }

  .image-item-edit-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
