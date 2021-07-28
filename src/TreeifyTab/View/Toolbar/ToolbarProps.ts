import {
  createDataFolderButtonProps,
  DataFolderButtonProps,
} from 'src/TreeifyTab/View/Toolbar/DataFolderButtonProps'

export type ToolbarProps = {
  dataFolderButtonProps: DataFolderButtonProps
}

export function createToolbarProps(): ToolbarProps {
  return {
    dataFolderButtonProps: createDataFolderButtonProps(),
  }
}
