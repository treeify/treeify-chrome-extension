<script context="module" lang="ts">
  import {doWithErrorCapture} from '../../errorCapture'
  import {External} from '../../External/External'
  import {Rerenderer} from '../../Rerenderer'

  function onClickBackdrop(event: Event) {
    doWithErrorCapture(() => {
      // ダイアログを閉じる
      if (event.eventPhase === Event.AT_TARGET) {
        External.instance.dialogState = undefined
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
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onKeyDown(event: KeyboardEvent) {
    doWithErrorCapture(() => {
      if (InputId.fromKeyboardEvent(event) === '0000Escape') {
        External.instance.dialogState = undefined
        Rerenderer.instance.rerender()
      }
    })
  }

  const style = `
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

  .context-menu-dialog_frame {
    /* topとleftはstyle属性で動的に設定する */
    position: absolute;

    /* lch(98.0%, 0.0, 0.0)相当 */
    background: #f9f9f9;

    /* lch(80.0%, 0.0, 0.0)相当 */
    border: #c6c6c6 1px solid;
    border-radius: 3px;
    /* 子要素を角丸からはみ出させない */
    overflow: hidden;

    /* lch(85.0%, 0.0, 0.0)相当 */
    box-shadow: 2px 2px 4px #d4d4d4;
  }
</style>
