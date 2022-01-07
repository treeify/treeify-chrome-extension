<script lang="ts">
  import { ContextMenuDialog } from 'src/TreeifyTab/External/DialogState'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import ContextMenuItem from 'src/TreeifyTab/View/Dialog/ContextMenuItem.svelte'
  import { createContextMenuItemPropses } from 'src/TreeifyTab/View/Dialog/ContextMenuItemProps'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { assertNonNull } from 'src/Utility/Debug/assert'
  import { NERist } from 'src/Utility/fp-ts'

  export let dialog: ContextMenuDialog

  const contextMenuItemPropses = createContextMenuItemPropses()

  const style = deriveStyle()

  function onMouseDownBackdrop(event: MouseEvent) {
    if (event.eventPhase === Event.AT_TARGET) {
      event.preventDefault()
      // ダイアログを閉じる
      if (InputId.fromMouseEvent(event) === '0000MouseButton0') {
        External.instance.dialogState = undefined
        Rerenderer.instance.rerender()
      }
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    if (InputId.fromKeyboardEvent(event) === '0000Escape') {
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    }
  }

  function onContextMenu(event: Event) {
    event.preventDefault()
  }

  function deriveStyle(): string {
    if (dialog.mousePosition !== undefined) {
      return `
        --left: calc(${dialog.mousePosition.x}px - 0.2em);
        --top: calc(${dialog.mousePosition.y}px - 0.5em);
      `
    }

    const itemPath = NERist.last(CurrentState.getSelectedItemPaths())
    const domElementId = MainAreaContentView.focusableDomElementId(itemPath)
    const domElement = document.getElementById(domElementId)
    assertNonNull(domElement)
    const rect = domElement.getBoundingClientRect()
    return `
      --left: ${rect.left}px;
      --top: ${rect.bottom}px;
    `
  }
</script>

<div
  class="context-menu-dialog_root"
  {style}
  on:mousedown={onMouseDownBackdrop}
  on:keydown={onKeyDown}
  on:contextmenu={onContextMenu}
  use:setupFocusTrap
>
  <div class="context-menu-dialog_frame">
    {#each contextMenuItemPropses.toArray() as contextMenuItemProps}
      <ContextMenuItem props={contextMenuItemProps} />
    {/each}
  </div>
</div>

<style global lang="scss">
  .context-menu-dialog_root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 30;
  }

  .context-menu-dialog_frame {
    position: absolute;
    left: var(--left);
    top: var(--top);

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
