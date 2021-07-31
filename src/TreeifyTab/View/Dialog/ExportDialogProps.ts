import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ExportFormat} from 'src/TreeifyTab/Internal/State'

export type ExportDialogProps = {
  selectedFormat: ExportFormat
}

export function createExportDialogProps(): ExportDialogProps {
  return {
    selectedFormat: Internal.instance.state.exportSettings.selectedFormat,
  }
}
