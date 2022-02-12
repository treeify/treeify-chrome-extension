import { WorkspaceId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { State } from 'src/TreeifyTab/Internal/State'
import {
  createDialogLayerProps,
  DialogLayerProps,
} from 'src/TreeifyTab/View/Dialog/DialogLayerProps'
import { createDragImageProps, DragImageProps } from 'src/TreeifyTab/View/DragImageProps'
import {
  createLeftSidebarProps,
  LeftSidebarProps,
} from 'src/TreeifyTab/View/LeftSidebar/LeftSidebarProps'
import { createMainAreaProps, MainAreaProps } from 'src/TreeifyTab/View/MainArea/MainAreaProps'
import { createToolbarProps, ToolbarProps } from 'src/TreeifyTab/View/Toolbar/ToolbarProps'

export type RootProps = {
  customCssHtml: string
  leftSidebarProps: LeftSidebarProps
  mainAreaProps: MainAreaProps
  toolbarProps: ToolbarProps
  dialogLayerProps: DialogLayerProps
  dragImageProps: DragImageProps | undefined
  currentWorkspaceId: WorkspaceId
}

export function createRootProps(state: State): RootProps {
  return {
    customCssHtml: `<style>${state.customCss}</style>`,
    leftSidebarProps: createLeftSidebarProps(state),
    mainAreaProps: createMainAreaProps(state),
    toolbarProps: createToolbarProps(),
    dialogLayerProps: createDialogLayerProps(),
    dragImageProps: createDragImageProps(),
    currentWorkspaceId: External.instance.getCurrentWorkspaceId(),
  }
}
