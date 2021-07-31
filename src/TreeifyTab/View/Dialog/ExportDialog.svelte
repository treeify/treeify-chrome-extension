<script lang="ts">
  import {ExportFormat} from 'src/TreeifyTab/Internal/State'
  import CommonDialog from './CommonDialog.svelte'
  import {ExportDialogProps} from './ExportDialogProps'

  export let props: ExportDialogProps
</script>

<CommonDialog title="エクスポート" showCloseButton>
  <div class="export-dialog_content" tabindex="0">
    <div class="export-dialog_format-select-button-area" on:change={props.onChange}>
      <label
        class="export-dialog_format-select-button"
        class:selected={props.selectedFormat === ExportFormat.PLAIN_TEXT}
      >
        <input type="radio" name="format" value={ExportFormat.PLAIN_TEXT} />
        プレーンテキスト
      </label>
      <label
        class="export-dialog_format-select-button"
        class:selected={props.selectedFormat === ExportFormat.MARKDOWN}
      >
        <input type="radio" name="format" value={ExportFormat.MARKDOWN} />
        Markdown
      </label>
      <label
        class="export-dialog_format-select-button"
        class:selected={props.selectedFormat === ExportFormat.OPML}
      >
        <input type="radio" name="format" value={ExportFormat.OPML} />
        OPML
      </label>
    </div>
    {#if props.selectedFormat === ExportFormat.PLAIN_TEXT}
      <div class="export-dialog_option-area">
        <label
          >インデントの表現: <input
            type="text"
            class="export-dialog_indentation-expression"
            value={props.indentationExpression}
            size="4"
            on:input={props.onInput}
          /></label
        >
        <label><input type="checkbox" disabled />折りたたみ状態の項目内を含める</label>
      </div>
    {:else if props.selectedFormat === ExportFormat.MARKDOWN}
      <div class="export-dialog_option-area">
        <label><input type="checkbox" checked disabled />折りたたみ状態の項目内を含める</label>
      </div>
    {:else if props.selectedFormat === ExportFormat.OPML}
      <div class="export-dialog_option-area">
        <label><input type="checkbox" checked disabled />折りたたみ状態の項目内を含める</label>
      </div>
    {/if}
    <div class="export-dialog_button-area">
      <button class="export-dialog_copy-button" on:click={props.onClickCopyButton}
        ><div class="export-dialog_copy-button-icon" />
        クリップボードにコピー</button
      >
      <button class="export-dialog_save-button" on:click={props.onClickSaveButton}
        ><div class="export-dialog_save-button-icon" />
        ファイルとして保存</button
      >
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .export-dialog_content {
    min-width: 30em;
    padding: 1em;

    outline: 0 solid transparent;
  }

  .export-dialog_format-select-button-area {
    display: flex;
  }

  .export-dialog_format-select-button {
    flex: 1 0;
    text-align: center;

    // lch(96.0%, 0.0, 0.0)相当
    background: #f3f3f3;

    // lch(80.0%, 0.0, 0.0)相当
    border: 1px solid #c6c6c6;

    &.selected {
      background: #ffffff;

      border-bottom-style: none;
    }
  }

  input[type='radio'][name='format'] {
    display: none;
  }

  .export-dialog_option-area {
    display: flex;
    flex-direction: column;

    padding: 1em;
    // lch(80.0%, 0.0, 0.0)相当
    border: 1px solid #c6c6c6;
    border-top-style: none;
  }

  .export-dialog_button-area {
    margin-top: 0.5em;

    // 中央寄せ
    margin-inline: auto;
    width: max-content;
  }

  .export-dialog_copy-button {
    display: inline-flex;
    align-items: center;
  }
  .export-dialog_copy-button-icon {
    width: 1.5em;
    aspect-ratio: 1;

    // lch(45.0%, 0.0, 0.0)相当
    background: #6a6a6a;
    -webkit-mask: url('clipboard-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }

  .export-dialog_save-button {
    display: inline-flex;
    align-items: center;
  }
  .export-dialog_save-button-icon {
    width: 1.5em;
    aspect-ratio: 1;

    // lch(45.0%, 0.0, 0.0)相当
    background: #6a6a6a;
    -webkit-mask: url('file-download-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
