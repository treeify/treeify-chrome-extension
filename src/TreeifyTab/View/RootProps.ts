import { WorkspaceId } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { State } from 'src/TreeifyTab/Internal/State'
import {
  createDialogLayerProps,
  DialogLayerProps,
} from 'src/TreeifyTab/View/Dialog/DialogLayerProps'
import {
  createDragAndDropLayerProps,
  DragAndDropLayerProps,
} from 'src/TreeifyTab/View/DragAndDropLayerProps'
import {
  createLeftSidebarProps,
  LeftSidebarProps,
} from 'src/TreeifyTab/View/LeftSidebar/LeftSidebarProps'
import { createMainAreaProps, MainAreaProps } from 'src/TreeifyTab/View/MainArea/MainAreaProps'
import { createToolbarProps, ToolbarProps } from 'src/TreeifyTab/View/Toolbar/ToolbarProps'
import UAParser from 'ua-parser-js'

const osName = new UAParser().getOS().name

export type RootProps = {
  customCssHtml: string
  leftSidebarProps: LeftSidebarProps
  mainAreaProps: MainAreaProps
  toolbarProps: ToolbarProps
  dialogLayerProps: DialogLayerProps
  dragAndDropLayerProps: DragAndDropLayerProps | undefined
  currentWorkspaceId: WorkspaceId
  osName: string | undefined
}

export function createRootProps(state: State): RootProps {
  return {
    customCssHtml: `<style>${state.customCss}</style>`,
    leftSidebarProps: createLeftSidebarProps(state),
    mainAreaProps: createMainAreaProps(state),
    toolbarProps: createToolbarProps(),
    dialogLayerProps: createDialogLayerProps(),
    dragAndDropLayerProps: createDragAndDropLayerProps(),
    currentWorkspaceId: External.instance.getCurrentWorkspaceId(),
    osName,
  }
}
