<script lang="ts">
  import {CitationSettingDialogProps} from './CitationSettingDialogProps'
  import CommonDialog from './CommonDialog.svelte'

  export let props: CitationSettingDialogProps
</script>

<CommonDialog title="出典設定">
  <div class="citation-setting-dialog_content">
    <div class="citation-setting-dialog_input-area">
      <label>出典タイトル</label>
      <input type="text" class="citation-setting-dialog_cite" value={props.cite} />
      <label>出典URL</label>
      <input type="url" class="citation-setting-dialog_cite-url" value={props.citeUrl} />
    </div>
    <div class="citation-setting-dialog_button-area">
      <button on:click={props.onClickFinishButton}>完了</button>
      <button on:click={props.onClickCancelButton}>キャンセル</button>
    </div>
  </div>
</CommonDialog>

<style>
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
    /* ボタン群を右寄せにする */
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
