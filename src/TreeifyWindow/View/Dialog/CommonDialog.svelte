<script context="module" lang="ts">
  import {createFocusTrap, FocusTrap} from 'focus-trap'
  import {assert} from '../../../Common/Debug/assert'
  import {doWithErrorCapture} from '../../errorCapture'

  // onInsertedとonRemovedの間でFocusTrapインスタンスを共有するためのグローバル変数
  let focusTrap: FocusTrap | undefined

  function onInserted(event: Event) {
    doWithErrorCapture(() => {
      // フォーカストラップを作る
      if (event.target instanceof HTMLElement) {
        assert(focusTrap === undefined)
        focusTrap = createFocusTrap(event.target, {
          returnFocusOnDeactivate: true,
          escapeDeactivates: false,
        })
        focusTrap.activate()
      }
    })
  }

  function onRemoved(event: Event) {
    doWithErrorCapture(() => {
      // フォーカストラップを消す
      if (focusTrap !== undefined) {
        focusTrap.deactivate()
        focusTrap = undefined
      }
    })
  }
</script>

<script lang='ts'>
  import {assert} from '../../../Common/Debug/assert'
  import {doWithErrorCapture} from '../../errorCapture'
  import {InputId} from '../../Internal/InputId'

  export let title: string

  export let onCloseDialog: () => void

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

<div class='common-dialog'
     on:click={onClickBackdrop}
     on:keydown={onKeyDown}
     on:DOMNodeInsertedIntoDocument={onInserted}
     on:DOMNodeRemovedFromDocument={onRemoved}>
  <div class='common-dialog_frame'>
    <div class='common-dialog_title-bar'>{title}</div>
    <slot />
  </div>
</div>

<style>
    :root {
        --code-block-padding: 0.2em;
    }

    /* コードブロックアイテムのコンテンツ領域のルート */
    .item-tree-code-block-content {
        /* フォーカス時の枠線を非表示 */
        outline: 0 solid transparent;

        overflow-x: auto;
    }

    .item-tree-code-block-content pre {
        border: 1px solid hsl(0, 0%, 80%);
        margin: 0;
        padding: var(--code-block-padding);
        /* これを指定しないとoverflowしたコードがborderからはみ出る */
        min-width: max-content;
        /* コードが空文字列のときにぺしゃんこにならないよう設定 */
        min-height: calc(var(--item-tree-calculated-line-height) + 2 * var(--code-block-padding));

        font-size: 90%;
    }

    /* グレーアウト状態のコードブロックアイテム */
    .grayed-out .item-tree-code-block-content {
        filter: opacity(50%);
    }
</style>
