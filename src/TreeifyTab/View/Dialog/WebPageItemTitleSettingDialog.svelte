<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { setupFocusTrap } from 'src/TreeifyTab/View/Dialog/focusTrap'
  import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
  import { assertNonNull, assertNonUndefined } from 'src/Utility/Debug/assert'

  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)
  let titleValue: string = CurrentState.deriveWebPageItemTitle(targetItemId)

  const domElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
  const domElement = document
    .getElementById(domElementId)
    ?.querySelector('.main-area-web-page-content_title')
  assertNonNull(domElement)
  assertNonUndefined(domElement)
  const rect = domElement.getBoundingClientRect()

  function onClickBackdrop(event: MouseEvent) {
    event.preventDefault()
    // ダイアログを閉じる
    if (InputId.fromMouseEvent(event) === '0000MouseButton0') {
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    }
  }

  function onContextMenu(event: Event) {
    event.preventDefault()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return

    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())

    if (event.key === 'Enter') {
      if (titleValue === '') {
        // 入力欄が空の状態でEnterキーを押したらタイトル設定を削除する
        CurrentState.setWebPageItemTitle(targetItemId, null)
      } else {
        CurrentState.setWebPageItemTitle(targetItemId, titleValue)
      }
      // タイトル設定ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    }

    if (InputId.fromKeyboardEvent(event) === '0000Escape') {
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    }
  }
</script>

<div
  class="web-page-item-title-setting-dialog_root"
  style:--left="{rect.left}px"
  style:--top="{rect.top}px"
  style:--width="{rect.width}px"
  style:--height="{rect.height}px"
  style:--font-size={window.getComputedStyle(domElement).getPropertyValue('font-size')}
  on:mousedown|self={onClickBackdrop}
  on:contextmenu={onContextMenu}
  use:setupFocusTrap
>
  <div class="web-page-item-title-setting-dialog_frame">
    <input
      type="text"
      class="web-page-item-title-setting-dialog_text-box"
      bind:value={titleValue}
      on:keydown={onKeyDown}
    />
  </div>
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .web-page-item-title-setting-dialog_root {
    position: fixed;
    top: 0;
    left: 0;
    @include common.size(100%);
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
    @include common.size(100%);
    padding: 0;
    border: none;
    font-size: var(--font-size);
  }
</style>
