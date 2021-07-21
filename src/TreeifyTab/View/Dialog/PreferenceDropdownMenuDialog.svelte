<script lang="ts">
  import {createFocusTrap} from 'focus-trap'
  import {doWithErrorCapture} from '../../errorCapture'
  import {External} from '../../External/External'
  import {InputId} from '../../Internal/InputId'
  import {Rerenderer} from '../../Rerenderer'
  import {PreferenceDropdownMenuDialogProps} from './PreferenceDropdownMenuDialogProps'
  import PreferenceDropdownMenuItem from './PreferenceDropdownMenuItem.svelte'

  export let props: PreferenceDropdownMenuDialogProps

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

  const style = `
    top: ${props.top}px;
    right: ${screen.width - props.right}px;
  `
</script>

<div
  class="preference-dropdown-menu-dialog"
  on:click={onClickBackdrop}
  on:keydown={onKeyDown}
  use:setupFocusTrap
>
  <div class="preference-dropdown-menu-dialog_frame" {style}>
    {#each props.itemPropses.toArray() as itemProps}
      <PreferenceDropdownMenuItem props={itemProps} />
    {/each}
  </div>
</div>

<style global>
  .preference-dropdown-menu-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 30;
  }

  .preference-dropdown-menu-dialog_frame {
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
