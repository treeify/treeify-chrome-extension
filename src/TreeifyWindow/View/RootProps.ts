import {State} from 'src/TreeifyWindow/Internal/State'
import {createDialogLayerProps, DialogLayerProps} from 'src/TreeifyWindow/View/Dialog/DialogLayer'
import {
  createLeftSidebarProps,
  LeftSidebarProps,
} from 'src/TreeifyWindow/View/LeftSidebar/LeftSidebarProps'
import {createMainAreaProps, MainAreaProps} from 'src/TreeifyWindow/View/MainArea/MainAreaProps'
import {createToolbarProps, ToolbarProps} from 'src/TreeifyWindow/View/Toolbar/ToolbarProps'

export type RootProps = {
  leftSidebarProps: LeftSidebarProps | undefined
  mainAreaProps: MainAreaProps
  toolbarProps: ToolbarProps
  dialogLayerProps: DialogLayerProps
}

export function createRootProps(state: State): RootProps {
  return {
    leftSidebarProps: createLeftSidebarProps(state),
    mainAreaProps: createMainAreaProps(state),
    toolbarProps: createToolbarProps(),
    dialogLayerProps: createDialogLayerProps(state),
  }
}
