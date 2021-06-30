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
  import {createFocusTrap, FocusTrap} from 'focus-trap'
  import {WebPageItemTitleSettingDialogProps} from './WebPageItemTitleSettingDialogProps'

  export let props: WebPageItemTitleSettingDialogProps

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
    left: ${props.webPageItemTitleSettingDialog.targetItemRect.left}px;
    top: ${props.webPageItemTitleSettingDialog.targetItemRect.top}px;
    width: ${props.webPageItemTitleSettingDialog.targetItemRect.width}px;
    height: ${props.webPageItemTitleSettingDialog.targetItemRect.height}px;
  `
</script>

<div class="web-page-item-title-setting-dialog" on:click={onClickBackdrop} use:setupFocusTrap>
  <div class="web-page-item-title-setting-dialog_frame" {style}>
    <input
      type="text"
      class="web-page-item-title-setting-dialog_text-box"
      value={props.initialTitle}
      on:keydown={props.onKeyDown}
    />
  </div>
</div>

<style>
  .web-page-item-title-setting-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* ウェブページアイテムのタイトル設定ダイアログ */
  .web-page-item-title-setting-dialog_frame {
    /*
        ウェブページアイテムの位置に合わせたフローティング。
        left, top, width, heightがJavaScriptで設定される。
        */
    position: absolute;
  }

  /* ウェブページアイテムのタイトル設定ダイアログのテキスト入力欄 */
  .web-page-item-title-setting-dialog_text-box {
    width: 100%;
    height: 100%;
  }
</style>
