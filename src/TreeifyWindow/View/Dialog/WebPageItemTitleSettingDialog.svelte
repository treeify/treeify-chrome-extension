<script context="module" lang="ts">
  import {assert} from '../../../Common/Debug/assert'
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'

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

  type WebPageItemTitleSettingDialogViewModel = {
    webPageItemTitleSettingDialog: WebPageItemTitleSettingDialog
    /** タイトル入力欄のテキストの初期値 */
    initialTitle: string
    onKeyDown: (event: KeyboardEvent) => void
  }

  export let viewModel: WebPageItemTitleSettingDialogViewModel

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

  $: style = `
    left: ${viewModel.webPageItemTitleSettingDialog.targetItemRect.left}px;
    top: ${viewModel.webPageItemTitleSettingDialog.targetItemRect.top}px;
    width: ${viewModel.webPageItemTitleSettingDialog.targetItemRect.width}px;
    height: ${viewModel.webPageItemTitleSettingDialog.targetItemRect.height}px;
  `
</script>

<div class="web-page-item-title-setting-dialog" on:click={onClickBackdrop} bind:this={domElement}>
  <div class="web-page-item-title-setting-dialog_frame" {style}>
    <input
      type="text"
      class="web-page-item-title-setting-dialog_text-box"
      value={viewModel.initialTitle}
      on:keydown={viewModel.onKeyDown}
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
