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
  import Checkbox from 'src/TreeifyTab/View/Checkbox.svelte'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { integer } from 'src/Utility/integer'

  let selectedFormat = Internal.instance.state.exportSettings.selectedFormat

  const plainTextOptions = Internal.instance.state.exportSettings.options[ExportFormat.PLAIN_TEXT]
  const markdownOptions = Internal.instance.state.exportSettings.options[ExportFormat.MARKDOWN]
  const opmlOptions = Internal.instance.state.exportSettings.options[ExportFormat.OPML]
  let plainTextIncludeInvisibleItems = plainTextOptions.includeInvisibleItems
  let indentationUnit = plainTextOptions.indentationUnit
  let minimumHeaderLevel: integer = markdownOptions.minimumHeaderLevel
  let markdownIncludeInvisibleItems = markdownOptions.includeInvisibleItems
  let opmlIncludeInvisibleItems = opmlOptions.includeInvisibleItems

  $: Internal.instance.mutate(selectedFormat, StatePath.of('exportSettings', 'selectedFormat'))

  $: Internal.instance.mutate(
    plainTextIncludeInvisibleItems,
    StatePath.of('exportSettings', 'options', ExportFormat.PLAIN_TEXT, 'includeInvisibleItems')
  )

  $: Internal.instance.mutate(
    indentationUnit,
    StatePath.of('exportSettings', 'options', ExportFormat.PLAIN_TEXT, 'indentationUnit')
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

    const itemId = ItemPath.getItemId(CurrentState.getSelectedItemPaths()[0])
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
        <input
          type="radio"
          class="export-dialog_tab-radio-button"
          bind:group={selectedFormat}
          value={ExportFormat.PLAIN_TEXT}
        />
        プレーンテキスト
      </label>
      <label
        class="export-dialog_format-select-button"
        class:selected={selectedFormat === ExportFormat.MARKDOWN}
      >
        <input
          type="radio"
          class="export-dialog_tab-radio-button"
          bind:group={selectedFormat}
          value={ExportFormat.MARKDOWN}
        />
        Markdown
      </label>
      <label
        class="export-dialog_format-select-button"
        class:selected={selectedFormat === ExportFormat.OPML}
      >
        <input
          type="radio"
          class="export-dialog_tab-radio-button"
          bind:group={selectedFormat}
          value={ExportFormat.OPML}
        />
        OPML
      </label>
    </div>
    <div class="export-dialog_option-area">
      {#if selectedFormat === ExportFormat.PLAIN_TEXT}
        <label class="export-dialog_text-input-label">
          インデントの表現:
          <input
            type="text"
            class="export-dialog_indentation-expression"
            bind:value={indentationUnit}
            size="4"
          />
        </label>
        <Checkbox bind:checked={plainTextIncludeInvisibleItems}>
          折りたたまれた項目も出力する
        </Checkbox>
      {:else if selectedFormat === ExportFormat.MARKDOWN}
        <label class="export-dialog_text-input-label">
          最上位の見出しの#の数:
          <input
            type="number"
            class="export-dialog_minimum-header-level"
            bind:value={minimumHeaderLevel}
            min="1"
            max="6"
          />
        </label>
        <Checkbox bind:checked={markdownIncludeInvisibleItems}>
          折りたたまれた項目も出力する
        </Checkbox>
      {:else if selectedFormat === ExportFormat.OPML}
        <Checkbox bind:checked={opmlIncludeInvisibleItems}>折りたたまれた項目も出力する</Checkbox>
      {/if}
    </div>
    <div class="export-dialog_bottom-button-area">
      <button class="export-dialog_copy-button" on:mousedown|preventDefault={onClickCopyButton}>
        <div class="export-dialog_copy-button-icon" />
        クリップボードにコピー
      </button>
      <button class="export-dialog_save-button" on:mousedown|preventDefault={onClickSaveButton}>
        <div class="export-dialog_save-button-icon" />
        ファイルとして保存
      </button>
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --export-dialog-tab-radius: #{common.em(0.4)};
  }

  .export-dialog_content {
    min-width: common.em(30);
    padding: common.em(1);

    outline: none;

    max-height: 100%;
    overflow-y: auto;
  }

  .export-dialog_format-select-button-area {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .export-dialog_format-select-button {
    @include common.flex-center;

    padding-block: common.em(0.18);
    padding-inline: common.em(1.2);

    border-top-left-radius: var(--export-dialog-tab-radius);
    border-top-right-radius: var(--export-dialog-tab-radius);

    background: lch(96% 0 0);

    border: 1px solid lch(80% 0 0);

    &.selected {
      background: lch(100% 0 0);

      border-bottom-style: none;
    }
  }

  .export-dialog_tab-radio-button {
    display: none;
  }

  .export-dialog_option-area {
    display: flex;
    flex-direction: column;
    // クリックの当たり判定が広がるのを防ぐ
    align-items: start;

    gap: common.em(0.5);

    padding: common.em(1);
    border: 1px solid lch(80% 0 0);
    border-top-style: none;
  }

  .export-dialog_bottom-button-area {
    margin-top: common.em(1);

    // 中央寄せ
    @include common.flex-center;
    gap: common.em(1.5);
  }

  .export-dialog_copy-button {
    display: inline-flex;
    align-items: center;
  }

  .export-dialog_copy-button-icon {
    @include common.size(common.em(1.5));

    @include common.icon(lch(45% 0 0), url('clipboard.svg'));
  }

  .export-dialog_save-button {
    display: inline-flex;
    align-items: center;
  }

  .export-dialog_save-button-icon {
    @include common.size(common.em(1.5));

    @include common.icon(lch(45% 0 0), url('file-download.svg'));
  }
</style>
