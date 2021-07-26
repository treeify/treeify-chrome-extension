<script lang="ts">
  import {doWithErrorCapture} from '../../errorCapture'
  import {External} from '../../External/External'
  import {InputId} from '../../Internal/InputId'
  import {Rerenderer} from '../../Rerenderer'
  import {DropdownMenuDialogProps} from './DropdownMenuDialogProps'
  import DropdownMenuItem from './DropdownMenuItem.svelte'
  import {setupFocusTrap} from './focusTrap'

  export let props: DropdownMenuDialogProps

  function onClickBackdrop(event: Event) {
    doWithErrorCapture(() => {
      // ダイアログを閉じる
      if (event.eventPhase === Event.AT_TARGET) {
        External.instance.dialogState = undefined
        Rerenderer.instance.rerender()
      }
    })
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
    top: ${props.top}px;
    right: ${screen.width - props.right}px;
  `
</script>

<div
  class="dropdown-menu-dialog"
  on:mousedown={onClickBackdrop}
  on:keydown={onKeyDown}
  use:setupFocusTrap
>
  <div class="dropdown-menu-dialog_frame" {style}>
    {#each props.itemPropses.toArray() as itemProps}
      <DropdownMenuItem props={itemProps} />
    {/each}
  </div>
</div>

<style global>
  .dropdown-menu-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 30;
  }

  .dropdown-menu-dialog_frame {
    /* topとrightをstyle属性で動的に設定する */
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
