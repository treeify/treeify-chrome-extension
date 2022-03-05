<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'

  let klass = ''
  export { klass as class }
  export let title: string
  export let onClose = () => {}
  export let showCloseButton: boolean = false

  function closeDialog() {
    External.instance.dialogState = undefined
    onClose()
    Rerenderer.instance.rerender()
  }

  const onMouseDownBackdrop = (event: MouseEvent) => {
    event.preventDefault()
    // ダイアログを閉じる
    if (InputId.fromMouseEvent(event) === '0000MouseButton0') {
      closeDialog()
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
  class="common-dialog_root"
  on:mousedown|self={onMouseDownBackdrop}
  on:contextmenu={onContextMenu}
  use:setupFocusTrap
>
  <div class="common-dialog_frame {klass}">
    <div class="common-dialog_title-bar">
      <div class="common-dialog_title">{title}</div>
      {#if showCloseButton}
        <div class="common-dialog_close-button" on:mousedown={closeDialog} />
      {/if}
    </div>
    <div class="common-dialog_content-area">
      <slot />
    </div>
  </div>
</div>

<!-- イベントを拾うためのフォーカス管理が面倒なのでこうする -->
<svelte:body on:keydown={onKeyDown} />

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .common-dialog_root {
    @include common.layer(30);

    // ダイアログを画面中央に表示する
    @include common.flex-center;
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

    background: lch(100% 0 0);
    box-shadow: 0 3px 14px lch(70% 0 0);
  }

  .common-dialog_title-bar {
    display: flex;
    align-items: center;
    column-gap: 1em;

    padding-inline: 0.5em;

    background: lch(25% 0 0);
  }

  .common-dialog_title {
    line-height: 2.2em;
    color: lch(100% 0 0);
  }

  .common-dialog_close-button {
    @include common.circle(1.6em);
    @include common.pseudo-ripple-effect(lch(40% 0 0));

    margin-left: auto;

    position: relative;

    &::before {
      content: '';
      @include common.size(0.8em);
      @include common.absolute-center;

      @include common.icon(lch(80% 0 0), url('close.svg'));
    }
  }

  .common-dialog_content-area {
    font-size: 0.95rem;
  }
</style>
