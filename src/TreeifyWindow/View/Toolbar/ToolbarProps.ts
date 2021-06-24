import {
  createDataFolderPickerOpenButtonProps,
  DataFolderPickerOpenButtonProps,
} from 'src/TreeifyWindow/View/Toolbar/DataFolderPickerOpenButtonProps'

export type ToolbarProps = {
  dataFolderPickerOpenButtonProps: DataFolderPickerOpenButtonProps
}

export function createToolbarProps(): ToolbarProps {
  return {
    dataFolderPickerOpenButtonProps: createDataFolderPickerOpenButtonProps(),
  }
}
