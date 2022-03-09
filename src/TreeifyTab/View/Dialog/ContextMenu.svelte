<script lang="ts">
  import { ContextMenu } from 'src/TreeifyTab/External/DialogState'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import ContextMenuItem from 'src/TreeifyTab/View/Dialog/ContextMenuItem.svelte'
  import { createContextMenuItemPropsGroups } from 'src/TreeifyTab/View/Dialog/ContextMenuItemProps'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'
  import DividerLayout from 'src/TreeifyTab/View/DividerLayout.svelte'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { assertNonNull } from 'src/Utility/Debug/assert'
  import { NERArray$ } from 'src/Utility/fp-ts'

  export let dialog: ContextMenu

  const contextMenuItemPropsGroups = createContextMenuItemPropsGroups()

  const style = deriveStyle()

  function onMouseDownBackdrop(event: MouseEvent) {
    event.preventDefault()
    // ダイアログを閉じる
    if (InputId.fromMouseEvent(event) === '0000MouseButton0') {
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
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

    const itemPath = NERArray$.last(CurrentState.getSelectedItemPaths())
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
  on:mousedown|self={onMouseDownBackdrop}
  on:keydown={onKeyDown}
  on:contextmenu={onContextMenu}
  use:setupFocusTrap
>
  <div class="context-menu-dialog_frame" tabindex="0">
    <DividerLayout contents={contextMenuItemPropsGroups}>
      <div slot="content" let:content={contextMenuItemPropsGroup}>
        {#each contextMenuItemPropsGroup as contextMenuItemProps}
          <ContextMenuItem props={contextMenuItemProps} />
        {/each}
      </div>
      <div slot="divider" class="context-menu-dialog_divider-area">
        <div class="context-menu-dialog_divider" />
      </div>
    </DividerLayout>
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .context-menu-dialog_root {
    @include common.layer(30);
  }

  .context-menu-dialog_frame {
    position: absolute;
    left: var(--left);
    top: var(--top);

    background: oklch(100% 0 0);

    border: oklch(80% 0 0) 1px solid;
    border-radius: 6px;
    // 子要素を角丸からはみ出させない
    overflow: hidden;

    box-shadow: 0 2px 10px oklch(75% 0 0);
  }

  .context-menu-dialog_divider-area {
    @include common.flex-center;
    height: 0.7em;
  }

  .context-menu-dialog_divider {
    height: 1px;
    width: 100%;
    background-color: oklch(90% 0 0);
  }
</style>
