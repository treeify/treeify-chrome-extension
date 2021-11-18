<script lang="ts">
  import { ExportFormat } from 'src/TreeifyTab/Internal/State'
  import CommonDialog from './CommonDialog.svelte'
  import { ExportDialogProps } from './ExportDialogProps'

  export let props: ExportDialogProps
</script>

<CommonDialog title="エクスポート" showCloseButton>
  <div class="export-dialog_content" tabindex="0">
    <div class="export-dialog_format-select-button-area" on:change={props.onChangeTabsRadioButton}>
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
    <div class="export-dialog_option-area">
      {#if props.selectedFormat === ExportFormat.PLAIN_TEXT}
        <label
          >インデントの表現: <input
            type="text"
            class="export-dialog_indentation-expression"
            value={props.indentationExpression}
            size="4"
            on:input={props.onInputIndentationExpression}
          /></label
        >
        <label class="export-dialog_checkbox-label"
          ><input
            type="checkbox"
            checked={props.plainTextIgnoreInvisibleItems}
            on:change={props.onChangePlainTextIgnoreInvisibleItems}
          />不可視の項目を無視する</label
        >
      {:else if props.selectedFormat === ExportFormat.MARKDOWN}
        <label
          >最上位の見出しの#の数: <input
            type="number"
            class="export-dialog_minimum-header-level"
            value={props.minimumHeaderLevel}
            min="1"
            max="6"
            on:input={props.onInputMinimumHeaderLevel}
          /></label
        >
        <label class="export-dialog_checkbox-label"
          ><input
            type="checkbox"
            checked={props.markdownIgnoreInvisibleItems}
            on:change={props.onChangeMarkdownIgnoreInvisibleItems}
          />不可視の項目を無視する</label
        >
      {:else if props.selectedFormat === ExportFormat.OPML}
        <label class="export-dialog_checkbox-label"
          ><input
            type="checkbox"
            checked={props.opmlIgnoreInvisibleItems}
            on:change={props.onChangeOpmlIgnoreInvisibleItems}
          />不可視の項目を無視する</label
        >
      {/if}
    </div>
    <div class="export-dialog_button-area">
      <button class="export-dialog_copy-button" on:click={props.onClickCopyButton}>
        <div class="export-dialog_copy-button-icon" />
        クリップボードにコピー
      </button>
      <button class="export-dialog_save-button" on:click={props.onClickSaveButton}>
        <div class="export-dialog_save-button-icon" />
        ファイルとして保存
      </button>
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .export-dialog_content {
    min-width: 30em;
    padding: 1em;

    outline: none;
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

    input[type='radio'][name='format'] {
      display: none;
    }
  }

  .export-dialog_option-area {
    padding: 1em;
    // lch(80.0%, 0.0, 0.0)相当
    border: 1px solid #c6c6c6;
    border-top-style: none;

    > * {
      display: block;
      width: fit-content;
    }
  }

  .export-dialog_checkbox-label {
    cursor: pointer;
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
