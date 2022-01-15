<script lang="ts">
  import { ItemType } from 'src/TreeifyTab/basicType'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
  import { exportAsIndentedText } from 'src/TreeifyTab/Internal/ImportExport/indentedText'
  import { toMarkdownText } from 'src/TreeifyTab/Internal/ImportExport/markdown'
  import { toOpmlString } from 'src/TreeifyTab/Internal/ImportExport/opml'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { ExportFormat } from 'src/TreeifyTab/Internal/State'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { integer } from 'src/Utility/integer'

  let selectedFormat = Internal.instance.state.exportSettings.selectedFormat

  const plainTextOptions = Internal.instance.state.exportSettings.options[ExportFormat.PLAIN_TEXT]
  const markdownOptions = Internal.instance.state.exportSettings.options[ExportFormat.MARKDOWN]
  const opmlOptions = Internal.instance.state.exportSettings.options[ExportFormat.OPML]
  let plainTextIncludeInvisibleItems = plainTextOptions.includeInvisibleItems
  let indentationExpression = plainTextOptions.indentationExpression
  let minimumHeaderLevel: integer = markdownOptions.minimumHeaderLevel
  let markdownIncludeInvisibleItems = markdownOptions.includeInvisibleItems
  let opmlIncludeInvisibleItems = opmlOptions.includeInvisibleItems

  $: Internal.instance.mutate(selectedFormat, StatePath.of('exportSettings', 'selectedFormat'))

  $: Internal.instance.mutate(
    plainTextIncludeInvisibleItems,
    StatePath.of('exportSettings', 'options', ExportFormat.PLAIN_TEXT, 'includeInvisibleItems')
  )

  $: Internal.instance.mutate(
    indentationExpression,
    StatePath.of('exportSettings', 'options', ExportFormat.PLAIN_TEXT, 'indentationExpression')
  )

  $: Internal.instance.mutate(
    minimumHeaderLevel,
    StatePath.of('exportSettings', 'options', ExportFormat.MARKDOWN, 'minimumHeaderLevel')
  )

  $: Internal.instance.mutate(
    markdownIncludeInvisibleItems,
    StatePath.of('exportSettings', 'options', ExportFormat.MARKDOWN, 'includeInvisibleItems')
  )

  $: Internal.instance.mutate(
    opmlIncludeInvisibleItems,
    StatePath.of('exportSettings', 'options', ExportFormat.OPML, 'includeInvisibleItems')
  )

  function onClickCopyButton() {
    navigator.clipboard.writeText(generateOutputText(selectedFormat))
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickSaveButton() {
    const content = generateOutputText(selectedFormat)
    const aElement = document.createElement('a')
    aElement.href = window.URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    aElement.download = deriveFileName(selectedFormat)
    aElement.click()
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function generateOutputText(format: ExportFormat): string {
    const exportSettings = Internal.instance.state.exportSettings
    switch (format) {
      case ExportFormat.PLAIN_TEXT:
        return CurrentState.getSelectedItemPaths().map(exportAsIndentedText).join('\n')
      case ExportFormat.MARKDOWN:
        const minimumHeaderLevel = exportSettings.options[ExportFormat.MARKDOWN].minimumHeaderLevel
        return CurrentState.getSelectedItemPaths()
          .map((selectedItemPath) => toMarkdownText(selectedItemPath, minimumHeaderLevel))
          .join('')
      case ExportFormat.OPML:
        const includeInvisibleItems =
          exportSettings.options[ExportFormat.OPML].includeInvisibleItems
        return toOpmlString(CurrentState.getSelectedItemPaths(), includeInvisibleItems)
    }
  }

  function deriveFileName(format: ExportFormat): string {
    const fileExtensions = {
      [ExportFormat.PLAIN_TEXT]: '.txt',
      [ExportFormat.MARKDOWN]: '.md',
      [ExportFormat.OPML]: '.opml',
    }
    const fileExtension = fileExtensions[format]
    const defaultFileName = 'export' + fileExtension

    const itemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    switch (Internal.instance.state.items[itemId].type) {
      case ItemType.TEXT:
        const domishObjects = Internal.instance.state.textItems[itemId].domishObjects
        const plainText = DomishObject.toPlainText(domishObjects)
        if (plainText === '') {
          return defaultFileName
        }
        return plainText.split(/\r?\n/)[0] + fileExtension
      case ItemType.WEB_PAGE:
        const webPageItem = Internal.instance.state.webPageItems[itemId]
        return (webPageItem.title ?? webPageItem.tabTitle) + fileExtension
      case ItemType.IMAGE:
        const imageItem = Internal.instance.state.imageItems[itemId]
        if (imageItem.caption !== '') {
          return imageItem.caption + fileExtension
        }
        return defaultFileName
      case ItemType.CODE_BLOCK:
        const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
        if (codeBlockItem.caption !== '') {
          return codeBlockItem.caption + fileExtension
        }
        return defaultFileName
      case ItemType.TEX:
        const texItem = Internal.instance.state.texItems[itemId]
        if (texItem.caption !== '') {
          return texItem.caption + fileExtension
        }
        return defaultFileName
    }
  }
</script>

<CommonDialog class="export-dialog_root" title="エクスポート" showCloseButton>
  <div class="export-dialog_content" tabindex="0">
    <div class="export-dialog_format-select-button-area">
      <label
        class="export-dialog_format-select-button"
        class:selected={selectedFormat === ExportFormat.PLAIN_TEXT}
      >
        <input type="radio" bind:group={selectedFormat} value={ExportFormat.PLAIN_TEXT} />
        プレーンテキスト
      </label>
      <label
        class="export-dialog_format-select-button"
        class:selected={selectedFormat === ExportFormat.MARKDOWN}
      >
        <input type="radio" bind:group={selectedFormat} value={ExportFormat.MARKDOWN} />
        Markdown
      </label>
      <label
        class="export-dialog_format-select-button"
        class:selected={selectedFormat === ExportFormat.OPML}
      >
        <input type="radio" bind:group={selectedFormat} value={ExportFormat.OPML} />
        OPML
      </label>
    </div>
    <div class="export-dialog_option-area">
      {#if selectedFormat === ExportFormat.PLAIN_TEXT}
        <label>
          インデントの表現:
          <input
            type="text"
            class="export-dialog_indentation-expression"
            bind:value={indentationExpression}
            size="4"
          />
        </label>
        <label class="export-dialog_checkbox-label">
          <input type="checkbox" bind:checked={plainTextIncludeInvisibleItems} />
          折りたたまれた項目も出力する
        </label>
      {:else if selectedFormat === ExportFormat.MARKDOWN}
        <label>
          最上位の見出しの#の数:
          <input
            type="number"
            class="export-dialog_minimum-header-level"
            bind:value={minimumHeaderLevel}
            min="1"
            max="6"
          />
        </label>
        <label class="export-dialog_checkbox-label">
          <input type="checkbox" bind:checked={markdownIncludeInvisibleItems} />
          折りたたまれた項目も出力する
        </label>
      {:else if selectedFormat === ExportFormat.OPML}
        <label class="export-dialog_checkbox-label">
          <input type="checkbox" bind:checked={opmlIncludeInvisibleItems} />
          折りたたまれた項目も出力する
        </label>
      {/if}
    </div>
    <div class="export-dialog_button-area">
      <button class="export-dialog_copy-button" on:click={onClickCopyButton}>
        <div class="export-dialog_copy-button-icon" />
        クリップボードにコピー
      </button>
      <button class="export-dialog_save-button" on:click={onClickSaveButton}>
        <div class="export-dialog_save-button-icon" />
        ファイルとして保存
      </button>
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .export-dialog_content {
    min-width: 30em;
    padding: 1em;

    outline: none;

    max-height: 100%;
    overflow-y: auto;
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

    input[type='radio'] {
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
    display: flex;
    align-items: center;

    cursor: pointer;
  }

  .export-dialog_button-area {
    margin-top: 0.5em;

    // 中央寄せ
    display: flex;
    justify-content: center;
    gap: 0.5em;
  }

  .export-dialog_copy-button {
    display: inline-flex;
    align-items: center;
  }

  .export-dialog_copy-button-icon {
    @include common.square(1.5em);

    // lch(45.0%, 0.0, 0.0)相当
    @include common.icon(#6a6a6a, url('clipboard.svg'));
  }

  .export-dialog_save-button {
    display: inline-flex;
    align-items: center;
  }

  .export-dialog_save-button-icon {
    @include common.square(1.5em);

    // lch(45.0%, 0.0, 0.0)相当
    @include common.icon(#6a6a6a, url('file-download.svg'));
  }
</style>
