<script lang="ts">
  import {External} from 'src/TreeifyTab/External/External'
  import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
  import {exportAsIndentedText} from 'src/TreeifyTab/Internal/ImportExport/indentedText'
  import {toMarkdownText} from 'src/TreeifyTab/Internal/ImportExport/markdown'
  import {toOpmlString} from 'src/TreeifyTab/Internal/ImportExport/opml'
  import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from './CommonDialog.svelte'
  import {ExportDialogProps, Format} from './ExportDialogProps'

  export let props: ExportDialogProps

  // TODO: 前回選択した値をデフォルト値とする
  let selectedFormat: Format = Format.PLAIN_TEXT

  function generateOutputText(): string {
    switch (selectedFormat) {
      case Format.PLAIN_TEXT:
        return CurrentState.getSelectedItemPaths().map(exportAsIndentedText).join('\n')
      case Format.MARKDOWN:
        // TODO: 複数選択時はそれらをまとめてMarkdown化する
        return toMarkdownText(CurrentState.getTargetItemPath())
      case Format.OPML:
        return toOpmlString(CurrentState.getSelectedItemPaths())
    }
  }

  function deriveFileName(): string {
    const fileExtensions = {
      [Format.PLAIN_TEXT]: '.txt',
      [Format.MARKDOWN]: '.md',
      [Format.OPML]: '.opml',
    }
    // TODO: ファイル名を内容依存にする。例えば先頭行テキストとか
    return 'export' + fileExtensions[selectedFormat]
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
</script>

<CommonDialog title="エクスポート" showCloseButton>
  <div class="export-dialog_content" tabindex="0">
    <div class="export-dialog_format-select-button-area">
      <label class="export-dialog_format-select-button">
        <input type="radio" name="format" bind:group={selectedFormat} value={Format.PLAIN_TEXT} />
        プレーンテキスト
      </label>
      <label class="export-dialog_format-select-button">
        <input type="radio" name="format" bind:group={selectedFormat} value={Format.MARKDOWN} />
        Markdown
      </label>
      <label class="export-dialog_format-select-button">
        <input type="radio" name="format" bind:group={selectedFormat} value={Format.OPML} />
        OPML
      </label>
    </div>
    {#if selectedFormat === Format.PLAIN_TEXT}
      <div class="export-dialog_option-area">
        <label><input type="checkbox" disabled />折りたたみ状態の項目内を含める</label>
      </div>
    {:else if selectedFormat === Format.MARKDOWN}
      <div class="export-dialog_option-area">
        <label><input type="checkbox" checked disabled />折りたたみ状態の項目内を含める</label>
      </div>
    {:else if selectedFormat === Format.OPML}
      <div class="export-dialog_option-area">
        <label><input type="checkbox" checked disabled />折りたたみ状態の項目内を含める</label>
      </div>
    {/if}
    <div class="export-dialog_button-area">
      <button class="export-dialog_copy-button" on:click={onClickCopyButton}
        >クリップボードにコピー</button
      >
      <button class="export-dialog_save-button" on:click={onClickSaveButton}
        >ファイルとして保存</button
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
  }

  input[type='radio'][name='format'] {
    display: none;
  }

  .export-dialog_option-area {
    display: flex;
    flex-direction: column;
  }

  .export-dialog_button-area {
    margin-top: 1em;
    margin-inline: auto;
    width: max-content;
  }
</style>
