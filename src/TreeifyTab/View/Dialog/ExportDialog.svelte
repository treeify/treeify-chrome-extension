<script lang="ts">
  import {External} from 'src/TreeifyTab/External/External'
  import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
  import {exportAsIndentedText} from 'src/TreeifyTab/Internal/ImportExport/indentedText'
  import {toMarkdownText} from 'src/TreeifyTab/Internal/ImportExport/markdown'
  import {toOpmlString} from 'src/TreeifyTab/Internal/ImportExport/opml'
  import {Internal} from 'src/TreeifyTab/Internal/Internal'
  import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
  import {ExportFormat} from 'src/TreeifyTab/Internal/State'
  import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from './CommonDialog.svelte'
  import {ExportDialogProps} from './ExportDialogProps'

  export let props: ExportDialogProps

  function generateOutputText(): string {
    switch (props.selectedFormat) {
      case ExportFormat.PLAIN_TEXT:
        return CurrentState.getSelectedItemPaths().map(exportAsIndentedText).join('\n')
      case ExportFormat.MARKDOWN:
        // TODO: 複数選択時はそれらをまとめてMarkdown化する
        return toMarkdownText(CurrentState.getTargetItemPath())
      case ExportFormat.OPML:
        return toOpmlString(CurrentState.getSelectedItemPaths())
    }
  }

  function deriveFileName(): string {
    const fileExtensions = {
      [ExportFormat.PLAIN_TEXT]: '.txt',
      [ExportFormat.MARKDOWN]: '.md',
      [ExportFormat.OPML]: '.opml',
    }
    // TODO: ファイル名を内容依存にする。例えば先頭行テキストとか
    return 'export' + fileExtensions[props.selectedFormat]
  }

  function onClickCopyButton() {
    const blob = new Blob([generateOutputText()], {type: 'text/plain'})
    navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ])
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickSaveButton() {
    const content = generateOutputText()
    const aElement = document.createElement('a')
    aElement.href = window.URL.createObjectURL(new Blob([content], {type: 'text/plain'}))
    aElement.download = deriveFileName()
    aElement.click()
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onChange(event: Event) {
    if (event.target instanceof HTMLInputElement) {
      const selectedFormat = event.target.value
      Internal.instance.mutate(selectedFormat, PropertyPath.of('exportSettings', 'selectedFormat'))
      Rerenderer.instance.rerender()
    }
  }
</script>

<CommonDialog title="エクスポート" showCloseButton>
  <div class="export-dialog_content" tabindex="0">
    <div class="export-dialog_format-select-button-area" on:change={onChange}>
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
      <button class="export-dialog_copy-button" on:click={onClickCopyButton}
        ><div class="export-dialog_copy-button-icon" />
        クリップボードにコピー</button
      >
      <button class="export-dialog_save-button" on:click={onClickSaveButton}
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
    --size: 1.5em;
    width: var(--size);
    height: var(--size);

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
    --size: 1.5em;
    width: var(--size);
    height: var(--size);

    // lch(45.0%, 0.0, 0.0)相当
    background: #6a6a6a;
    -webkit-mask: url('file-download-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
