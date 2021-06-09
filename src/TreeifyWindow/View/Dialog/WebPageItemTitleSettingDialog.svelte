<script context="module" lang="ts">
  import {assert} from '../../../Common/Debug/assert'
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {InputId} from '../../Internal/InputId'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'

  export function createWebPageItemTitleSettingDialogProps() {
    const state = Internal.instance.state
    if (state.webPageItemTitleSettingDialog === null) return undefined

    const targetItemPath = state.pages[CurrentState.getActivePageId()].targetItemPath
    const targetItemId = ItemPath.getItemId(targetItemPath)

    return {
      webPageItemTitleSettingDialog: state.webPageItemTitleSettingDialog,
      initialTitle: CurrentState.deriveWebPageItemTitle(targetItemId),
      onKeyDown: (event: KeyboardEvent) => {
        doWithErrorCapture(() => {
          if (event.isComposing) return

          if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
            if (event.target.value === '') {
              // 入力欄が空の状態でEnterキーを押したらタイトル設定を削除する
              CurrentState.setWebPageItemTitle(targetItemId, null)
            } else {
              CurrentState.setWebPageItemTitle(targetItemId, event.target.value)
            }
            // タイトル設定ダイアログを閉じる
            CurrentState.setWebPageItemTitleSettingDialog(null)
            CurrentState.commit()
          }

          if (InputId.fromKeyboardEvent(event) === '0000Escape') {
            CurrentState.setWebPageItemTitleSettingDialog(null)
            CurrentState.commit()
          }
        })
      },
    }
  }

  function onClickBackdrop(event: Event) {
    doWithErrorCapture(() => {
      // ダイアログを閉じる
      if (event.eventPhase === Event.AT_TARGET) {
        CurrentState.setWebPageItemTitleSettingDialog(null)
        CurrentState.commit()
      }
    })
  }
</script>

<script lang="ts">
  import {createFocusTrap, FocusTrap} from 'focus-trap'
  import {onDestroy, onMount} from 'svelte'
  import {assertNonUndefined} from '../../../Common/Debug/assert'
  import {WebPageItemTitleSettingDialog} from '../../Internal/State'

  export let webPageItemTitleSettingDialog: WebPageItemTitleSettingDialog
  /** タイトル入力欄のテキストの初期値 */
  export let initialTitle: string
  export let onKeyDown: (event: KeyboardEvent) => void

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
        // この機能を使うとイベント発生順序の違いにより難解なエラーが起こるので、
        // ESCキー押下時にダイアログを閉じる処理は自前で実装する。
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

  const style = `
    left: ${webPageItemTitleSettingDialog.targetItemRect.left}px;
    top: ${webPageItemTitleSettingDialog.targetItemRect.top}px;
    width: ${webPageItemTitleSettingDialog.targetItemRect.width}px;
    height: ${webPageItemTitleSettingDialog.targetItemRect.height}px;
  `
</script>

<div class="web-page-item-title-setting-dialog" on:click={onClickBackdrop} bind:this={domElement}>
  <div class="web-page-item-title-setting-dialog_frame" {style}>
    <input
      type="text"
      class="web-page-item-title-setting-dialog_text-box"
      value={initialTitle}
      on:keydown={onKeyDown}
    />
  </div>
</div>

<style>
  .web-page-item-title-setting-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* ウェブページアイテムのタイトル設定ダイアログ */
  .web-page-item-title-setting-dialog_frame {
    /*
        ウェブページアイテムの位置に合わせたフローティング。
        left, top, width, heightがJavaScriptで設定される。
        */
    position: absolute;
  }

  /* ウェブページアイテムのタイトル設定ダイアログのテキスト入力欄 */
  .web-page-item-title-setting-dialog_text-box {
    width: 100%;
    height: 100%;
  }
</style>
