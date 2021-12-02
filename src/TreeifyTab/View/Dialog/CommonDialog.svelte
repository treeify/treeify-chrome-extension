<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'

  export let title: string
  export let onClose = () => {}
  export let showCloseButton: boolean = false

  function closeDialog() {
    External.instance.dialogState = undefined
    onClose()
    Rerenderer.instance.rerender()
  }

  const onMouseDownBackdrop = (event: MouseEvent) => {
    if (event.eventPhase === Event.AT_TARGET) {
      event.preventDefault()
      // ダイアログを閉じる
      if (InputId.fromMouseEvent(event) === '0000MouseButton0') {
        closeDialog()
      }
    }
  }

  function onContextMenu(event: Event) {
    event.preventDefault()
  }

  // ESCキー押下時にダイアログを閉じるためのイベントハンドラー。
  // focus-trapにはESCキー押下時にdeactivateする標準機能があるが、
  // それを使うとイベント発生順序の違いにより難解なエラーが起こるので自前でハンドリングする。
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.isComposing) return

    if (InputId.fromKeyboardEvent(event) === '0000Escape') {
      closeDialog()
    }
  }
</script>

<div
  class="common-dialog"
  on:mousedown={onMouseDownBackdrop}
  on:keydown={onKeyDown}
  on:contextmenu={onContextMenu}
  use:setupFocusTrap
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
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // lch(25.0%, 0.0, 0.0)相当
    --common-dialog-title-bar-background: #3b3b3b;
  }

  .common-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 30;

    // ダイアログを画面中央に表示する
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .common-dialog_frame {
    max-width: 90vw;
    max-height: 90vh;

    // 各ダイアログコンポーネントで縦スクロールを自由に設定できるようにする
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);

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
    column-gap: 1em;

    padding-inline: 0.5em;

    background: var(--common-dialog-title-bar-background);
  }

  .common-dialog_title {
    line-height: 2.2em;
    color: #ffffff;
  }

  .common-dialog_close-button {
    @include common.square(1.4em);

    margin-left: auto;

    &:hover {
      // lch(40.0%, 0.0, 0.0)相当
      background: #5e5e5e;
    }

    &::before {
      content: '';
      @include common.square(0.8em);
      @include common.absolute-center;

      // lch(80.0%, 0.0, 0.0)相当
      background: #c6c6c6;
      -webkit-mask-image: url('close-icon.svg');
    }
  }

  .common-dialog_content-area {
    font-size: 0.95rem;
  }
</style>
