<script lang="ts">
  import {CitationSettingDialogProps} from './CitationSettingDialogProps'
  import CommonDialog from './CommonDialog.svelte'
  import FinishAndCancelButtons from './FinishAndCancelButtons.svelte'

  export let props: CitationSettingDialogProps
</script>

<CommonDialog title="出典設定">
  <div class="citation-setting-dialog_content" on:keydown={props.onKeyDown}>
    <div class="citation-setting-dialog_input-area">
      <label>タイトル</label>
      <input type="text" class="citation-setting-dialog_cite-title" value={props.title} />
      <label>URL</label>
      <input type="url" class="citation-setting-dialog_cite-url" value={props.url} />
    </div>
    <div class="citation-setting-dialog_button-area">
      <FinishAndCancelButtons
        onClickFinishButton={props.onClickFinishButton}
        onClickCancelButton={props.onClickCancelButton}
      />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .citation-setting-dialog_content {
    width: 90vw;
    max-width: 40em;
    padding: 1em;
  }

  .citation-setting-dialog_input-area {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-gap: 0.5em;
  }

  .citation-setting-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
