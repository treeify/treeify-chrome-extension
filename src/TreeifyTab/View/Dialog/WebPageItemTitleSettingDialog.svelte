<script context="module" lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'

  function onClickBackdrop(event: Event) {
    // ダイアログを閉じる
    if (event.eventPhase === Event.AT_TARGET) {
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    }
  }
</script>

<script lang="ts">
  import { WebPageItemTitleSettingDialogProps } from 'src/TreeifyTab/View/Dialog/WebPageItemTitleSettingDialogProps'

  export let props: WebPageItemTitleSettingDialogProps

  $: style = `
    --left: ${props.rect.left}px;
    --top: ${props.rect.top}px;
    --width: ${props.rect.width}px;
    --height: ${props.rect.height}px;
    --font-size: ${props.fontSize};
  `
</script>

<div
  class="web-page-item-title-setting-dialog"
  {style}
  on:mousedown={onClickBackdrop}
  use:setupFocusTrap
>
  <div class="web-page-item-title-setting-dialog_frame">
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
    // ウェブページ項目の位置に合わせたフローティング
    position: absolute;
    left: var(--left);
    top: var(--top);
    width: var(--width);
    height: var(--height);
  }

  // ウェブページ項目のタイトル設定ダイアログのテキスト入力欄
  .web-page-item-title-setting-dialog_text-box {
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    font-size: var(--font-size);
  }
</style>
