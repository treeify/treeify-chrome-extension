<script lang="ts">
  import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
  import {exportAsIndentedText} from 'src/TreeifyTab/Internal/ImportExport/indentedText'
  import {toMarkdownText} from 'src/TreeifyTab/Internal/ImportExport/markdown'
  import {toOpmlString} from 'src/TreeifyTab/Internal/ImportExport/opml'
  import CommonDialog from './CommonDialog.svelte'
  import {ExportDialogProps} from './ExportDialogProps'

  export let props: ExportDialogProps

  // TODO: 前回選択した値をデフォルト値とする
  let selectedFormat: 'Plain text' | 'Markdown' | 'OPML' = 'Plain text'

  function generateOutputText(): string {
    switch (selectedFormat) {
      case 'Plain text':
        return CurrentState.getSelectedItemPaths().map(exportAsIndentedText).join('\n')
      case 'Markdown':
        // TODO: 複数選択時はそれらをまとめてMarkdown化する
        return toMarkdownText(CurrentState.getTargetItemPath())
      case 'OPML':
        return toOpmlString(CurrentState.getSelectedItemPaths())
    }
  }

  function deriveFileName(): string {
    const fileExtensions = {
      'Plain text': '.txt',
      Markdown: '.md',
      OPML: '.opml',
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
  }

  function onClickSaveButton() {
    const content = generateOutputText()
    const aElement = document.createElement('a')
    aElement.href = window.URL.createObjectURL(new Blob([content], {type: 'text/plain'}))
    aElement.download = deriveFileName()
    aElement.click()
  }
</script>

<CommonDialog title="エクスポート" showCloseButton>
  <div class="export-dialog_content" tabindex="0">
    <label>
      <input type="radio" name="format" bind:group={selectedFormat} value="Plain text" />
      プレーンテキスト
    </label>
    <label>
      <input type="radio" name="format" bind:group={selectedFormat} value="Markdown" />
      Markdown
    </label>
    <label>
      <input type="radio" name="format" bind:group={selectedFormat} value="OPML" />
      OPML
    </label>
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

<style global>
  .export-dialog_content {
    padding: 1em;

    outline: 0 solid transparent;
  }

  .export-dialog_button-area {
    margin-top: 1em;
  }
</style>
