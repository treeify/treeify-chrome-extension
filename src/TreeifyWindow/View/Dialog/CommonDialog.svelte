<script lang="ts">
  import {createFocusTrap, FocusTrap} from 'focus-trap'
  import {doWithErrorCapture} from '../../errorCapture'
  import {InputId} from '../../Internal/InputId'

  export let title: string

  export let onCloseDialog: () => void

  function setupFocusTrap(domElement: HTMLElement) {
    return doWithErrorCapture(() => {
      // フォーカストラップを作る
      const focusTrap: FocusTrap = createFocusTrap(domElement, {
        returnFocusOnDeactivate: true,
        escapeDeactivates: false,
      })
      focusTrap.activate()

      return {
        destroy: () => {
          doWithErrorCapture(() => {
            // フォーカストラップを消す
            focusTrap.deactivate()
          })
        },
      }
    })
  }

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

<div class="common-dialog" on:click={onClickBackdrop} on:keydown={onKeyDown} use:setupFocusTrap>
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
