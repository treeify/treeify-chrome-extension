<script lang="ts">
  import {createFocusTrap, FocusTrap} from 'focus-trap'
  import {onDestroy, onMount} from 'svelte'
  import {assert, assertNonUndefined} from '../../../Common/Debug/assert'
  import {doWithErrorCapture} from '../../errorCapture'
  import {InputId} from '../../Internal/InputId'

  export let title: string

  export let onCloseDialog: () => void

  let focusTrap: FocusTrap | undefined

  // focusTrapのターゲットとして指定するためにDOM要素が必要
  let domElement: HTMLElement | undefined

  onMount(() => {
    doWithErrorCapture(() => {
      // フォーカストラップを作る
      assert(focusTrap === undefined)
      assertNonUndefined(domElement)
      focusTrap = createFocusTrap(domElement, {
        returnFocusOnDeactivate: true,
        escapeDeactivates: false,
      })
      focusTrap.activate()
    })
  })

  onDestroy(() => {
    doWithErrorCapture(() => {
      // フォーカストラップを消す
      if (focusTrap !== undefined) {
        focusTrap.deactivate()
        focusTrap = undefined
      }
    })
  })

  const onClickBackdrop = (event: MouseEvent) => {
    doWithErrorCapture(() => {
      // ダイアログを閉じる
      if (event.eventPhase === Event.AT_TARGET) {
        onCloseDialog()
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
        onCloseDialog()
      }
    })
  }
</script>

<div class="common-dialog" on:click={onClickBackdrop} on:keydown={onKeyDown} bind:this={domElement}>
  <div class="common-dialog_frame">
    <div class="common-dialog_title-bar">{title}</div>
    <slot />
  </div>
</div>

<style>
  :root {
    --common-dialog-border-radius: 5px;

    --common-dialog-title-bar-background: hsl(0, 0%, 25%);
  }

  .common-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* ツールバーやサイドバーより高い位置にいる */
    z-index: 3;

    /* バックドロップ */
    background: hsla(0, 0%, 0%, 0.1);

    /* ダイアログを画面中央に表示する */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .common-dialog_frame {
    border-radius: var(--common-dialog-border-radius);
    /* 子要素を角丸からはみ出させない */
    overflow: hidden;

    background: hsl(0, 0%, 100%);
    box-shadow: 0 1.5px 8px hsl(0, 0%, 50%);
  }

  .common-dialog_title-bar {
    font-size: 15px;
    padding: 0.3em;

    background: var(--common-dialog-title-bar-background);
    color: white;
  }
</style>
