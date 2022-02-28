<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import DropdownMenuDialog from 'src/TreeifyTab/View/Dialog/DropdownMenuDialog.svelte'
  import { DropdownMenuDialogProps } from 'src/TreeifyTab/View/Dialog/DropdownMenuDialogProps'
  import { assertNonUndefined } from 'src/Utility/Debug/assert'

  function createDropdownMenuDialogProps(): DropdownMenuDialogProps {
    const preferenceButton = document.querySelector('.preference-button_icon')?.parentElement
    const rect = preferenceButton?.getBoundingClientRect()
    assertNonUndefined(rect)

    return {
      top: rect.bottom,
      right: rect.right,
      itemPropses: [
        {
          title: 'キーボード操作設定',
          onClick: () => {
            External.instance.dialogState = { type: 'KeyBindingDialog' }
          },
        },
        {
          title: '拡張機能ショートカット設定',
          onClick: () => {
            chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
          },
        },
        {
          title: 'カスタムCSS',
          onClick: () => {
            External.instance.dialogState = { type: 'CustomCssDialog' }
          },
        },
        {
          title: 'ワークスペース',
          onClick: () => Command.showWorkspaceDialog(),
        },
        {
          title: 'その他の設定',
          onClick: () => {
            External.instance.dialogState = { type: 'OtherSettingsDialog' }
          },
        },
      ],
    }
  }
</script>

<DropdownMenuDialog props={createDropdownMenuDialogProps()} />
