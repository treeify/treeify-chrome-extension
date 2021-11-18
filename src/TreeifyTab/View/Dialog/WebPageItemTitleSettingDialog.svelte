<script context="module" lang="ts">
  import { doWithErrorCapture } from '../../errorCapture'
  import { External } from '../../External/External'
  import { Rerenderer } from '../../Rerenderer'

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
  import { WebPageItemTitleSettingDialogProps } from './WebPageItemTitleSettingDialogProps'
  import { setupFocusTrap } from './focusTrap'

  export let props: WebPageItemTitleSettingDialogProps

  $: style = `
    left: ${props.webPageItemTitleSettingDialog.targetItemRect.left}px;
    top: ${props.webPageItemTitleSettingDialog.targetItemRect.top}px;
    width: ${props.webPageItemTitleSettingDialog.targetItemRect.width}px;
    height: ${props.webPageItemTitleSettingDialog.targetItemRect.height}px;
  `
</script>

<div class="web-page-item-title-setting-dialog" on:mousedown={onClickBackdrop} use:setupFocusTrap>
  <div class="web-page-item-title-setting-dialog_frame" {style}>
    <input
      type="text"
      class="web-page-item-title-setting-dialog_text-box"
      value={props.initialTitle}
      on:keydown={props.onKeyDown}
    />
  </div>
</div>

<style global lang="scss">
  .web-page-item-title-setting-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 30;
  }

  // ウェブページ項目のタイトル設定ダイアログ
  .web-page-item-title-setting-dialog_frame {
    // ウェブページ項目の位置に合わせたフローティング。
    // left, top, width, heightがJavaScriptで設定される。
    position: absolute;
  }

  // ウェブページ項目のタイトル設定ダイアログのテキスト入力欄
  .web-page-item-title-setting-dialog_text-box {
    width: 100%;
    height: 100%;
  }
</style>
