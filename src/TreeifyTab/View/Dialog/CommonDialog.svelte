<script lang="ts">
  import {fade} from 'svelte/transition'
  import {doWithErrorCapture} from '../../errorCapture'
  import {External} from '../../External/External'
  import {InputId} from '../../Internal/InputId'
  import {Rerenderer} from '../../Rerenderer'
  import {setupFocusTrap} from './focusTrap'

  export let title: string
  export let onClose = () => {}
  export let showCloseButton: boolean = false

  function closeDialog() {
    External.instance.dialogState = undefined
    onClose()
    Rerenderer.instance.rerender()
  }

  const onClickBackdrop = (event: MouseEvent) => {
    doWithErrorCapture(() => {
      // ダイアログを閉じる
      if (event.eventPhase === Event.AT_TARGET) {
        closeDialog()
      }
    })
  }

  // ESCキー押下時にダイアログを閉じるためのイベントハンドラー。
  // focus-trapにはESCキー押下時にdeactivateする標準機能があるが、
  // それを使うとイベント発生順序の違いにより難解なエラーが起こるので自前でハンドリングする。
  const onKeyDown = (event: KeyboardEvent) => {
    doWithErrorCapture(() => {
      if (event.isComposing) return

      if (InputId.fromKeyboardEvent(event) === '0000Escape') {
        closeDialog()
      }
    })
  }
</script>

<div
  class="common-dialog"
  on:mousedown={onClickBackdrop}
  on:keydown={onKeyDown}
  use:setupFocusTrap
  transition:fade={{duration: 50}}
>
  <div class="common-dialog_frame">
    <div class="common-dialog_title-bar">
      <div class="common-dialog_title">{title}</div>
      {#if showCloseButton}
        <div class="common-dialog_close-button icon-button" on:mousedown={closeDialog} />
      {/if}
    </div>
    <div class="common-dialog_content-area">
      <slot />
    </div>
  </div>
</div>

<style global lang="scss">
  :root {
    // lch(25.0%, 0.0, 0.0)相当
    --common-dialog-title-bar-background: #3b3b3b;
    --common-dialog-title-bar-height: 2.2em;
  }

  .common-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 30;

    // バックドロップ
    background: hsla(0, 0%, 0%, 0.1);

    // ダイアログを画面中央に表示する
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .common-dialog_frame {
    max-width: 90vw;

    border-radius: 5px;
    // 子要素を角丸からはみ出させない
    overflow: hidden;

    background: #ffffff;
    // lch(50.0%, 0.0, 0.0)相当
    box-shadow: 0 1.5px 8px #777777;
  }

  .common-dialog_title-bar {
    display: flex;
    align-items: center;

    padding-inline: 0.5em;

    background: var(--common-dialog-title-bar-background);
  }

  .common-dialog_title {
    line-height: var(--common-dialog-title-bar-height);
    color: white;
  }

  .common-dialog_close-button {
    --button-size: 1.4em;
    width: var(--button-size);
    height: var(--button-size);

    margin-left: auto;

    &:hover {
      // lch(40.0%, 0.0, 0.0)相当
      background: #5e5e5e;
    }

    &::before {
      content: '';
      --icon-size: 0.8em;
      width: var(--icon-size);
      height: var(--icon-size);

      // 中央寄せ
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      // lch(80.0%, 0.0, 0.0)相当
      background: #c6c6c6;
      -webkit-mask-image: url('close-icon.svg');
    }
  }

  .common-dialog_content-area {
    max-height: calc(90vh - var(--common-dialog-title-bar-height));
    overflow-y: auto;

    font-size: 0.95rem;
  }
</style>
