import {integer} from 'src/Common/integer'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {exportAsIndentedText} from 'src/TreeifyTab/Internal/ImportExport/indentedText'
import {toMarkdownText} from 'src/TreeifyTab/Internal/ImportExport/markdown'
import {toOpmlString} from 'src/TreeifyTab/Internal/ImportExport/opml'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {ExportFormat} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

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
      const blob = new Blob([generateOutputText(selectedFormat)], {type: 'text/plain'})
      navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
    onClickSaveButton: () => {
      const content = generateOutputText(selectedFormat)
      const aElement = document.createElement('a')
      aElement.href = window.URL.createObjectURL(new Blob([content], {type: 'text/plain'}))
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
  switch (format) {
    case ExportFormat.PLAIN_TEXT:
      return CurrentState.getSelectedItemPaths().map(exportAsIndentedText).join('\n')
    case ExportFormat.MARKDOWN:
      const exportSettings = Internal.instance.state.exportSettings
      const minimumHeaderLevel = exportSettings.options[ExportFormat.MARKDOWN].minimumHeaderLevel
      return CurrentState.getSelectedItemPaths()
        .map((selectedItemPath) => toMarkdownText(selectedItemPath, minimumHeaderLevel))
        .join('')
    case ExportFormat.OPML:
      return toOpmlString(CurrentState.getSelectedItemPaths())
  }
}

function deriveFileName(format: ExportFormat): string {
  const fileExtensions = {
    [ExportFormat.PLAIN_TEXT]: '.txt',
    [ExportFormat.MARKDOWN]: '.md',
    [ExportFormat.OPML]: '.opml',
  }
  // TODO: ファイル名を内容依存にする。例えば先頭行テキストとか
  return 'export' + fileExtensions[format]
}
