<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { DropdownMenuDialogProps } from 'src/TreeifyTab/View/Dialog/DropdownMenuDialogProps'
  import DropdownMenuItem from 'src/TreeifyTab/View/Dialog/DropdownMenuItem.svelte'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'
  import DividerLayout from 'src/TreeifyTab/View/DividerLayout.svelte'

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
</script>

<div
  class="dropdown-menu-dialog_root"
  style:--top="{props.top}px"
  style:--right="{window.innerWidth - props.right}px"
  on:mousedown|self={onClickBackdrop}
  on:keydown={onKeyDown}
  on:contextmenu={onContextMenu}
  use:setupFocusTrap
>
  <div class="dropdown-menu-dialog_frame">
    <DividerLayout class="dropdown-menu-dialog_menu-items" contents={props.itemPropsGroups}>
      <div slot="content" let:content={itemPropsGroup}>
        {#each itemPropsGroup as itemProps}
          <DropdownMenuItem props={itemProps} />
        {/each}
      </div>
      <div slot="divider" class="dropdown-menu-dialog_divider-area">
        <div class="dropdown-menu-dialog_divider" />
      </div>
    </DividerLayout>
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .dropdown-menu-dialog_root {
    @include common.layer(30);
  }

  .dropdown-menu-dialog_frame {
    position: absolute;
    top: var(--top);
    right: var(--right);

    background: oklch(100% 0 0);

    border: oklch(80% 0 0) 1px solid;
    border-radius: 6px;
    // 子要素を角丸からはみ出させない
    overflow: hidden;

    box-shadow: 0 1px 6px oklch(75% 0 0);
  }

  .dropdown-menu-dialog_divider-area {
    @include common.flex-center;
    height: 0.7em;
  }

  .dropdown-menu-dialog_divider {
    height: 1px;
    width: 100%;
    background-color: oklch(90% 0 0);
  }
</style>
