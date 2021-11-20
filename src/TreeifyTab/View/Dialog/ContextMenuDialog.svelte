<script context="module" lang="ts">
  import { doWithErrorCapture } from 'src/TreeifyTab/errorCapture'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

  function onClickBackdrop(event: Event) {
    doWithErrorCapture(() => {
      // ダイアログを閉じる
      if (event.eventPhase === Event.AT_TARGET) {
        event.preventDefault()
        External.instance.dialogState = undefined
        Rerenderer.instance.rerender()
      }
    })
  }
</script>

<script lang="ts">
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { ContextMenuDialogProps } from 'src/TreeifyTab/View/Dialog/ContextMenuDialogProps'
  import ContextMenuItem from 'src/TreeifyTab/View/Dialog/ContextMenuItem.svelte'
  import { External } from 'src/TreeifyTab/External/External'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'

  export let props: ContextMenuDialogProps

  function onKeyDown(event: KeyboardEvent) {
    doWithErrorCapture(() => {
      if (InputId.fromKeyboardEvent(event) === '0000Escape') {
        External.instance.dialogState = undefined
        Rerenderer.instance.rerender()
      }
    })
  }

  function onContextMenu(event: Event) {
    // キーボードでコンテキストメニューを呼び出した際にブラウザの標準コンテキストメニューが表示される問題への対策
    event.preventDefault()
  }

  const style = `
    left: calc(${props.mousePosition.x}px - 0.8em);
    top: calc(${props.mousePosition.y}px - 0.8em);
  `
</script>

<div
  class="context-menu-dialog"
  on:mousedown={onClickBackdrop}
  on:keydown={onKeyDown}
  on:contextmenu={onContextMenu}
  use:setupFocusTrap
>
  <div class="context-menu-dialog_frame" {style}>
    {#each props.contextMenuItemPropses.toArray() as contextMenuItemProps}
      <ContextMenuItem props={contextMenuItemProps} />
    {/each}
  </div>
</div>

<style global lang="scss">
  .context-menu-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 30;
  }

  .context-menu-dialog_frame {
    // topとleftはstyle属性で動的に設定する
    position: absolute;

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
