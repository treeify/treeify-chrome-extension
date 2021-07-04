<script context="module" lang="ts">
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {Rerenderer} from '../../Rerenderer'

  function onClickBackdrop(event: Event) {
    doWithErrorCapture(() => {
      // ダイアログを閉じる
      if (event.eventPhase === Event.AT_TARGET) {
        CurrentState.setDialog(null)
        Rerenderer.instance.rerender()
      }
    })
  }
</script>

<script lang="ts">
  import {InputId} from '../../Internal/InputId'
  import ContextMenuItem from './ContextMenuItem.svelte'
  import {createFocusTrap, FocusTrap} from 'focus-trap'
  import {ContextMenuDialogProps} from './ContextMenuDialogProps'

  export let props: ContextMenuDialogProps

  function setupFocusTrap(domElement: HTMLElement) {
    return doWithErrorCapture(() => {
      // フォーカストラップを作る
      const focusTrap = createFocusTrap(domElement, {
        returnFocusOnDeactivate: false,

        escapeDeactivates: false,
      })
      focusTrap.activate()

      return {
        destroy: () => {
          // フォーカストラップを消す
          focusTrap.deactivate()
        },
      }
    })
  }

  function onContextMenu(event: Event) {
    // コンテキストメニュー表示中に別の場所にコンテキストメニューを出そうとした場合、
    // ブラウザ標準のコンテキストメニューが出ると混乱するので出さないようにする。
    event.preventDefault()

    // 本来なら現在のマウス位置にコンテキストメニューを出し直したいところだが、
    // 仕様と実装が難しいのでコンテキストメニューを閉じるに留める。
    CurrentState.setDialog(null)
    Rerenderer.instance.rerender()
  }

  function onKeyDown(event: KeyboardEvent) {
    doWithErrorCapture(() => {
      if (InputId.fromKeyboardEvent(event) === '0000Escape') {
        CurrentState.setDialog(null)
        Rerenderer.instance.rerender()
      }
    })
  }

  $: style = `
    left: ${props.mousePosition.x}px;
    top: ${props.mousePosition.y}px;
  `
</script>

<div
  class="context-menu-dialog"
  on:click={onClickBackdrop}
  on:contextmenu={onContextMenu}
  on:keydown={onKeyDown}
  use:setupFocusTrap
>
  <div class="context-menu-dialog_frame" {style}>
    {#each props.contextMenuItemPropses.toArray() as contextMenuItemProps}
      <ContextMenuItem props={contextMenuItemProps} />
    {/each}
  </div>
</div>

<style>
  .context-menu-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* ウェブページアイテムのタイトル設定ダイアログ */
  .context-menu-dialog_frame {
    /* topとleftはstyle属性で動的に設定する */
    position: absolute;

    background: hsl(0, 0%, 96%);

    box-shadow: 0 1.5px 8px hsl(0, 0%, 50%);
  }
</style>
