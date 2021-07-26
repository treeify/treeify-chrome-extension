import {Dialog} from 'src/TreeifyTab/External/DialogState'
import {External} from 'src/TreeifyTab/External/External'
import {createExportDialogProps} from 'src/TreeifyTab/View/Dialog/ExportDialogProps'
import {createImageItemEditDialogProps} from 'src/TreeifyTab/View/Dialog/ImageItemEditDialogProps'
import {createItemAdditionDropdownMenuDialogProps} from 'src/TreeifyTab/View/Dialog/ItemAdditionDropdownMenuDialogProps'
import CitationSettingDialog from './CitationSettingDialog.svelte'
import {createCitationSettingDialogProps} from './CitationSettingDialogProps'
import CodeBlockItemEditDialog from './CodeBlockItemEditDialog.svelte'
import {createCodeBlockItemEditDialogProps} from './CodeBlockItemEditDialogProps'
import ContextMenuDialog from './ContextMenuDialog.svelte'
import {createContextMenuDialogProps} from './ContextMenuDialogProps'
import DropdownMenuDialog from './DropdownMenuDialog.svelte'
import ExportDialog from './ExportDialog.svelte'
import ImageItemEditDialog from './ImageItemEditDialog.svelte'
import OtherParentsDialog from './OtherParentsDialog.svelte'
import {createOtherParentsDialogProps} from './OtherParentsDialogProps'
import CustomCssDialog from './Preference/CustomCssDialog.svelte'
import {createCustomCssDialogProps} from './Preference/CustomCssDialogProps'
import KeyBindingDialog from './Preference/KeyBindingDialog.svelte'
import {createKeyBindingDialogProps} from './Preference/KeyBindingDialogProps'
import {createPreferenceDropdownMenuDialogProps} from './Preference/PreferenceDropdownMenuDialogProps'
import WorkspaceDialog from './Preference/WorkspaceDialog.svelte'
import {createWorkspaceDialogProps} from './Preference/WorkspaceDialogProps'
import SearchDialog from './SearchDialog.svelte'
import {createSearchDialogProps} from './SearchDialogProps'
import TexEditDialog from './TexEditDialog.svelte'
import {createTexEditDialogProps} from './TexEditDialogProps'
import WebPageItemTitleSettingDialog from './WebPageItemTitleSettingDialog.svelte'
import {createWebPageItemTitleSettingDialogProps} from './WebPageItemTitleSettingDialogProps'

export type DialogLayerProps = {
  dialog: {component: any; props: any} | undefined
}

export function createDialogLayerProps(): DialogLayerProps {
  if (External.instance.dialogState === undefined) {
    return {
      dialog: undefined,
    }
  }

  return {
    dialog: createDialogMaterials(External.instance.dialogState),
  }
}

function createDialogMaterials(dialogState: Dialog): {component: any; props: any} {
  switch (dialogState.type) {
    case 'CitationSettingDialog':
      return {
        component: CitationSettingDialog,
        props: createCitationSettingDialogProps(dialogState),
      }
    case 'CodeBlockItemEditDialog':
      return {
        component: CodeBlockItemEditDialog,
        props: createCodeBlockItemEditDialogProps(dialogState),
      }
    case 'ContextMenuDialog':
      return {
        component: ContextMenuDialog,
        props: createContextMenuDialogProps(dialogState),
      }
    case 'CustomCssDialog':
      return {
        component: CustomCssDialog,
        props: createCustomCssDialogProps(),
      }
    case 'ExportDialog':
      return {
        component: ExportDialog,
        props: createExportDialogProps(),
      }
    case 'ImageItemEditDialog':
      return {
        component: ImageItemEditDialog,
        props: createImageItemEditDialogProps(),
      }
    case 'ItemAdditionDropdownMenuDialog':
      return {
        component: DropdownMenuDialog,
        props: createItemAdditionDropdownMenuDialogProps(),
      }
    case 'KeyBindingDialog':
      return {
        component: KeyBindingDialog,
        props: createKeyBindingDialogProps(),
      }
    case 'PreferenceDropdownMenuDialog':
      return {
        component: DropdownMenuDialog,
        props: createPreferenceDropdownMenuDialogProps(),
      }
    case 'OtherParentsDialog':
      return {
        component: OtherParentsDialog,
        props: createOtherParentsDialogProps(dialogState),
      }
    case 'SearchDialog':
      return {
        component: SearchDialog,
        props: createSearchDialogProps(dialogState),
      }
    case 'TexEditDialog':
      return {
        component: TexEditDialog,
        props: createTexEditDialogProps(dialogState),
      }
    case 'WebPageItemTitleSettingDialog':
      return {
        component: WebPageItemTitleSettingDialog,
        props: createWebPageItemTitleSettingDialogProps(dialogState),
      }
    case 'WorkspaceDialog':
      return {
        component: WorkspaceDialog,
        props: createWorkspaceDialogProps(dialogState),
      }
  }
}
