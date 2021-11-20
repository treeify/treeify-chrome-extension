import { Dialog } from 'src/TreeifyTab/External/DialogState'
import { External } from 'src/TreeifyTab/External/External'
import CaptionSettingDialog from 'src/TreeifyTab/View/Dialog/CaptionSettingDialog.svelte'
import { createCaptionSettingDialogProps } from 'src/TreeifyTab/View/Dialog/CaptionSettingDialogProps'
import CitationSettingDialog from 'src/TreeifyTab/View/Dialog/CitationSettingDialog.svelte'
import { createCitationSettingDialogProps } from 'src/TreeifyTab/View/Dialog/CitationSettingDialogProps'
import CodeBlockItemEditDialog from 'src/TreeifyTab/View/Dialog/CodeBlockItemEditDialog.svelte'
import { createCodeBlockItemEditDialogProps } from 'src/TreeifyTab/View/Dialog/CodeBlockItemEditDialogProps'
import CodeBlockLanguageSettingDialog from 'src/TreeifyTab/View/Dialog/CodeBlockLanguageSettingDialog.svelte'
import { createCodeBlockLanguageSettingDialogProps } from 'src/TreeifyTab/View/Dialog/CodeBlockLanguageSettingDialogProps'
import ContextMenuDialog from 'src/TreeifyTab/View/Dialog/ContextMenuDialog.svelte'
import { createContextMenuDialogProps } from 'src/TreeifyTab/View/Dialog/ContextMenuDialogProps'
import DropdownMenuDialog from 'src/TreeifyTab/View/Dialog/DropdownMenuDialog.svelte'
import ExportDialog from 'src/TreeifyTab/View/Dialog/ExportDialog.svelte'
import { createExportDialogProps } from 'src/TreeifyTab/View/Dialog/ExportDialogProps'
import ImageItemEditDialog from 'src/TreeifyTab/View/Dialog/ImageItemEditDialog.svelte'
import { createImageItemEditDialogProps } from 'src/TreeifyTab/View/Dialog/ImageItemEditDialogProps'
import { createItemAdditionDropdownMenuDialogProps } from 'src/TreeifyTab/View/Dialog/ItemAdditionDropdownMenuDialogProps'
import OtherParentsDialog from 'src/TreeifyTab/View/Dialog/OtherParentsDialog.svelte'
import { createOtherParentsDialogProps } from 'src/TreeifyTab/View/Dialog/OtherParentsDialogProps'
import OtherSettingsDialog from 'src/TreeifyTab/View/Dialog/OtherSettingsDialog.svelte'
import { createOtherSettingsDialogProps } from 'src/TreeifyTab/View/Dialog/OtherSettingsDialogProps'
import CustomCssDialog from 'src/TreeifyTab/View/Dialog/Preference/CustomCssDialog.svelte'
import { createCustomCssDialogProps } from 'src/TreeifyTab/View/Dialog/Preference/CustomCssDialogProps'
import KeyBindingDialog from 'src/TreeifyTab/View/Dialog/Preference/KeyBindingDialog.svelte'
import { createKeyBindingDialogProps } from 'src/TreeifyTab/View/Dialog/Preference/KeyBindingDialogProps'
import { createPreferenceDropdownMenuDialogProps } from 'src/TreeifyTab/View/Dialog/Preference/PreferenceDropdownMenuDialogProps'
import WorkspaceDialog from 'src/TreeifyTab/View/Dialog/Preference/WorkspaceDialog.svelte'
import { createWorkspaceDialogProps } from 'src/TreeifyTab/View/Dialog/Preference/WorkspaceDialogProps'
import SearchDialog from 'src/TreeifyTab/View/Dialog/SearchDialog.svelte'
import { createSearchDialogProps } from 'src/TreeifyTab/View/Dialog/SearchDialogProps'
import TabsDialog from 'src/TreeifyTab/View/Dialog/TabsDialog.svelte'
import { createTabsDialogProps } from 'src/TreeifyTab/View/Dialog/TabsDialogProps'
import TexEditDialog from 'src/TreeifyTab/View/Dialog/TexEditDialog.svelte'
import { createTexEditDialogProps } from 'src/TreeifyTab/View/Dialog/TexEditDialogProps'
import WebPageItemTitleSettingDialog from 'src/TreeifyTab/View/Dialog/WebPageItemTitleSettingDialog.svelte'
import { createWebPageItemTitleSettingDialogProps } from 'src/TreeifyTab/View/Dialog/WebPageItemTitleSettingDialogProps'

export type DialogLayerProps = {
  dialog: { component: any; props: any } | undefined
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

function createDialogMaterials(dialogState: Dialog): { component: any; props: any } {
  switch (dialogState.type) {
    case 'CaptionSettingDialog':
      return {
        component: CaptionSettingDialog,
        props: createCaptionSettingDialogProps(),
      }
    case 'CitationSettingDialog':
      return {
        component: CitationSettingDialog,
        props: createCitationSettingDialogProps(),
      }
    case 'CodeBlockItemEditDialog':
      return {
        component: CodeBlockItemEditDialog,
        props: createCodeBlockItemEditDialogProps(),
      }
    case 'CodeBlockLanguageSettingDialog':
      return {
        component: CodeBlockLanguageSettingDialog,
        props: createCodeBlockLanguageSettingDialogProps(),
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
        props: createOtherParentsDialogProps(),
      }
    case 'OtherSettingsDialog':
      return {
        component: OtherSettingsDialog,
        props: createOtherSettingsDialogProps(),
      }
    case 'SearchDialog':
      return {
        component: SearchDialog,
        props: createSearchDialogProps(),
      }
    case 'TabsDialog':
      return {
        component: TabsDialog,
        props: createTabsDialogProps(dialogState),
      }
    case 'TexEditDialog':
      return {
        component: TexEditDialog,
        props: createTexEditDialogProps(),
      }
    case 'WebPageItemTitleSettingDialog':
      return {
        component: WebPageItemTitleSettingDialog,
        props: createWebPageItemTitleSettingDialogProps(dialogState),
      }
    case 'WorkspaceDialog':
      return {
        component: WorkspaceDialog,
        props: createWorkspaceDialogProps(),
      }
  }
}
