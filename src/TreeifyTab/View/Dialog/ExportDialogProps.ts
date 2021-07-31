import {assertNonNull} from 'src/Common/Debug/assert'
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
  onClickCopyButton: () => void
  onClickSaveButton: () => void
  onChange: (event: Event) => void
}

export function createExportDialogProps(): ExportDialogProps {
  const selectedFormat = Internal.instance.state.exportSettings.selectedFormat

  return {
    selectedFormat,
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
    onChange: (event: Event) => {
      if (event.target instanceof HTMLInputElement) {
        const selectedFormat = event.target.value
        Internal.instance.mutate(
          selectedFormat,
          PropertyPath.of('exportSettings', 'selectedFormat')
        )
        Rerenderer.instance.rerender()
      }
    },
  }
}

function generateOutputText(format: ExportFormat): string {
  switch (format) {
    case ExportFormat.PLAIN_TEXT:
      const input = document.querySelector<HTMLInputElement>('.export-dialog_indent-unit')
      assertNonNull(input)
      return CurrentState.getSelectedItemPaths()
        .map((itemPath) => exportAsIndentedText(itemPath, input.value))
        .join('\n')
    case ExportFormat.MARKDOWN:
      // TODO: 複数選択時はそれらをまとめてMarkdown化する
      return toMarkdownText(CurrentState.getTargetItemPath())
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
