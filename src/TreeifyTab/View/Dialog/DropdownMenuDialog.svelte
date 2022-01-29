<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { DropdownMenuDialogProps } from 'src/TreeifyTab/View/Dialog/DropdownMenuDialogProps'
  import DropdownMenuItem from 'src/TreeifyTab/View/Dialog/DropdownMenuItem.svelte'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'

  export let props: DropdownMenuDialogProps

  function onClickBackdrop(event: MouseEvent) {
    event.preventDefault()
    // ダイアログを閉じる
    if (InputId.fromMouseEvent(event) === '0000MouseButton0') {
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    }
  }

  function onContextMenu(event: Event) {
    event.preventDefault()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (InputId.fromKeyboardEvent(event) === '0000Escape') {
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    }
  }

  const style = `
    --top: ${props.top}px;
    --right: ${props.right}px;
    --screen-width: ${screen.width}px;
  `
</script>

<div
  class="dropdown-menu-dialog_root"
  {style}
  on:mousedown|self={onClickBackdrop}
  on:keydown={onKeyDown}
  on:contextmenu={onContextMenu}
  use:setupFocusTrap
>
  <div class="dropdown-menu-dialog_frame">
    {#each props.itemPropses as itemProps}
      <DropdownMenuItem props={itemProps} />
    {/each}
  </div>
</div>

<style global lang="scss">
  .dropdown-menu-dialog_root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 30;
  }

  .dropdown-menu-dialog_frame {
    position: absolute;
    top: var(--top);
    right: calc(var(--screen-width) - var(--right));

    // lch(98.0%, 0.0, 0.0)相当
    background: #f9f9f9;

    // lch(80.0%, 0.0, 0.0)相当
    border: #c6c6c6 1px solid;
    border-radius: 3px;
    // 子要素を角丸からはみ出させない
    overflow: hidden;

    // lch(85.0%, 0.0, 0.0)相当
    box-shadow: 2px 2px 4px #d4d4d4;
  }
</style>
