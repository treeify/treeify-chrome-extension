import { createSyncButtonProps, SyncButtonProps } from 'src/TreeifyTab/View/Toolbar/SyncButtonProps'

export type ToolbarProps = {
  syncButtonProps: SyncButtonProps
}

export function createToolbarProps(): ToolbarProps {
  return {
    syncButtonProps: createSyncButtonProps(),
  }
}
