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

  $: style = `
    left: ${props.mousePosition.x}px;
    top: ${props.mousePosition.y}px;
  `
</script>

<div class="context-menu-dialog" on:click={onClickBackdrop} use:setupFocusTrap>
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

    padding: 0.5em;
  }
</style>
