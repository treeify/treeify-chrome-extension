<script lang="ts">
  import {createFocusTrap} from 'focus-trap'
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {InputId} from '../../Internal/InputId'
  import {Rerenderer} from '../../Rerenderer'
  
  export let title: string
  export let onClose = () => {}

  function setupFocusTrap(domElement: HTMLElement) {
    return doWithErrorCapture(() => {
      // フォーカストラップを作る
      const focusTrap = createFocusTrap(domElement, {
        // フォーカスは自前で管理するのでfocusTrapに勝手に操作されると困る。
        // 具体的には検索結果へのジャンプ機能で自動スクロールが動かなくなる。
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

  const onClickBackdrop = (event: MouseEvent) => {
    doWithErrorCapture(() => {
      // ダイアログを閉じる
      if (event.eventPhase === Event.AT_TARGET) {
        CurrentState.setDialog(null)
        onClose()
        Rerenderer.instance.rerender()
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
        CurrentState.setDialog(null)
        onClose()
        Rerenderer.instance.rerender()
      }
    })
  }
</script>

<div class="common-dialog" on:click={onClickBackdrop} on:keydown={onKeyDown} use:setupFocusTrap>
  <div class="common-dialog_frame">
    <div class="common-dialog_title-bar">{title}</div>
    <div class="common-dialog_content-area">
      <slot />
    </div>
  </div>
</div>

<style>
  :root {
    --common-dialog-border-radius: 5px;

    --common-dialog-title-bar-background: hsl(0, 0%, 25%);
    --common-dialog-title-bar-height: 2.2em;
  }

  .common-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 30;

    /* バックドロップ */
    background: hsla(0, 0%, 0%, 0.1);

    /* ダイアログを画面中央に表示する */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .common-dialog_frame {
    max-width: 90vw;

    border-radius: var(--common-dialog-border-radius);
    /* 子要素を角丸からはみ出させない */
    overflow: hidden;

    background: hsl(0, 0%, 100%);
    box-shadow: 0 1.5px 8px hsl(0, 0%, 50%);
  }

  .common-dialog_title-bar {
    font-size: 15px;
    line-height: var(--common-dialog-title-bar-height);
    padding-left: 0.5em;

    background: var(--common-dialog-title-bar-background);
    color: white;
  }

  .common-dialog_content-area {
    max-height: calc(90vh - var(--common-dialog-title-bar-height));
    overflow-y: auto;

    font-size: 14px;
  }
</style>
