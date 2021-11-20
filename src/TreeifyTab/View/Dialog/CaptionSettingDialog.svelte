<script lang="ts">
  import { CaptionSettingDialogProps } from 'src/TreeifyTab/View/Dialog/CaptionSettingDialogProps'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'

  export let props: CaptionSettingDialogProps
</script>

<CommonDialog title="キャプション設定">
  <div class="caption-setting-dialog_content" on:keydown={props.onKeyDown}>
    <input type="text" class="caption-setting-dialog_caption" value={props.initialCaption} />
    <div class="caption-setting-dialog_button-area">
      <FinishAndCancelButtons
        onClickFinishButton={props.onClickFinishButton}
        onClickCancelButton={props.onClickCancelButton}
      />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .caption-setting-dialog_content {
    min-width: 20em;
    padding: 1em;
  }

  .caption-setting-dialog_caption {
    width: 100%;
  }

  .caption-setting-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
