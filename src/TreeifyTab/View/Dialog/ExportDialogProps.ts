import { integer } from 'src/Common/integer'
import { ItemType } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
import { exportAsIndentedText } from 'src/TreeifyTab/Internal/ImportExport/indentedText'
import { toMarkdownText } from 'src/TreeifyTab/Internal/ImportExport/markdown'
import { toOpmlString } from 'src/TreeifyTab/Internal/ImportExport/opml'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { ExportFormat } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

export type ExportDialogProps = {
  selectedFormat: ExportFormat
  plainTextIgnoreInvisibleItems: boolean
  indentationExpression: string
  markdownIgnoreInvisibleItems: boolean
  minimumHeaderLevel: integer
  opmlIgnoreInvisibleItems: boolean
  onClickCopyButton: () => void
  onClickSaveButton: () => void
  onChangeTabsRadioButton: (event: Event) => void
  onChangePlainTextIgnoreInvisibleItems: (event: Event) => void
  onInputIndentationExpression: (event: Event) => void
  onInputMinimumHeaderLevel: (event: Event) => void
  onChangeMarkdownIgnoreInvisibleItems: (event: Event) => void
  onChangeOpmlIgnoreInvisibleItems: (event: Event) => void
}

export function createExportDialogProps(): ExportDialogProps {
  const selectedFormat = Internal.instance.state.exportSettings.selectedFormat
  const plainTextOptions = Internal.instance.state.exportSettings.options[ExportFormat.PLAIN_TEXT]
  const markdownOptions = Internal.instance.state.exportSettings.options[ExportFormat.MARKDOWN]
  const opmlOptions = Internal.instance.state.exportSettings.options[ExportFormat.OPML]

  return {
    selectedFormat,
    plainTextIgnoreInvisibleItems: plainTextOptions.ignoreInvisibleItems,
    indentationExpression: plainTextOptions.indentationExpression,
    minimumHeaderLevel: markdownOptions.minimumHeaderLevel,
    markdownIgnoreInvisibleItems: markdownOptions.ignoreInvisibleItems,
    opmlIgnoreInvisibleItems: opmlOptions.ignoreInvisibleItems,
    onClickCopyButton: () => {
      navigator.clipboard.writeText(generateOutputText(selectedFormat))
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
    onClickSaveButton: () => {
      const content = generateOutputText(selectedFormat)
      const aElement = document.createElement('a')
      aElement.href = window.URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
      aElement.download = deriveFileName(selectedFormat)
      aElement.click()
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
    onChangeTabsRadioButton: (event: Event) => {
      if (event.target instanceof HTMLInputElement) {
        const selectedFormat = event.target.value
        Internal.instance.mutate(
          selectedFormat,
          PropertyPath.of('exportSettings', 'selectedFormat')
        )
        Rerenderer.instance.rerender()
      }
    },
    onChangePlainTextIgnoreInvisibleItems(event: Event) {
      if (event.target instanceof HTMLInputElement) {
        Internal.instance.mutate(
          event.target.checked,
          PropertyPath.of(
            'exportSettings',
            'options',
            ExportFormat.PLAIN_TEXT,
            'ignoreInvisibleItems'
          )
        )
      }
    },
    onInputIndentationExpression(event: Event) {
      if (event.target instanceof HTMLInputElement) {
        Internal.instance.mutate(
          event.target.value,
          PropertyPath.of(
            'exportSettings',
            'options',
            ExportFormat.PLAIN_TEXT,
            'indentationExpression'
          )
        )
      }
    },
    onInputMinimumHeaderLevel(event: Event) {
      if (event.target instanceof HTMLInputElement) {
        Internal.instance.mutate(
          parseInt(event.target.value),
          PropertyPath.of('exportSettings', 'options', ExportFormat.MARKDOWN, 'minimumHeaderLevel')
        )
      }
    },
    onChangeMarkdownIgnoreInvisibleItems(event: Event) {
      if (event.target instanceof HTMLInputElement) {
        Internal.instance.mutate(
          event.target.checked,
          PropertyPath.of(
            'exportSettings',
            'options',
            ExportFormat.MARKDOWN,
            'ignoreInvisibleItems'
          )
        )
      }
    },
    onChangeOpmlIgnoreInvisibleItems(event: Event) {
      if (event.target instanceof HTMLInputElement) {
        Internal.instance.mutate(
          event.target.checked,
          PropertyPath.of('exportSettings', 'options', ExportFormat.OPML, 'ignoreInvisibleItems')
        )
      }
    },
  }
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
      const ignoreInvisibleItems = exportSettings.options[ExportFormat.OPML].ignoreInvisibleItems
      return toOpmlString(CurrentState.getSelectedItemPaths(), ignoreInvisibleItems)
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
