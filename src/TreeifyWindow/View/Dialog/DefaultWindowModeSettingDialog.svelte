<script context="module" lang="ts">
  import {assertNonNull} from '../../../Common/Debug/assert'
  import {CurrentState} from '../../Internal/CurrentState'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import {DefaultWindowMode} from '../../Internal/State'

  export function createDefaultWindowModeSettingDialogProps() {
    const state = Internal.instance.state
    if (state.defaultWindowModeSettingDialog === null) return undefined

    const targetItemPath = CurrentState.getTargetItemPath()
    const targetItemId = ItemPath.getItemId(targetItemPath)
    const targetPageId = CurrentState.isPage(targetItemId)
      ? targetItemId
      : ItemPath.getRootItemId(targetItemPath)

    return {
      ...state.defaultWindowModeSettingDialog,
      initialDefaultWindowMode: state.pages[targetPageId].defaultWindowMode,
      onClickFinishButton: () => {
        // デフォルトウィンドウモードを更新
        const form = document.querySelector<HTMLFormElement>(
          '.default-window-mode-setting-dialog_option-list'
        )
        assertNonNull(form)
        const selectedDefaultWindowMode = form.defaultWindowMode.value as DefaultWindowMode
        CurrentState.setDefaultWindowMode(targetPageId, selectedDefaultWindowMode)

        // タイムスタンプを更新
        CurrentState.updateItemTimestamp(targetPageId)

        // ダイアログを閉じる
        CurrentState.setDefaultWindowModeSettingDialog(null)
        CurrentState.commit()
      },
      onClickCancelButton: () => {
        // ダイアログを閉じる
        CurrentState.setDefaultWindowModeSettingDialog(null)
        CurrentState.commit()
      },
    }
  }
</script>

<script lang="ts">
  import {doWithErrorCapture} from '../../errorCapture'
  import CommonDialog from './CommonDialog.svelte'

  export let initialDefaultWindowMode: DefaultWindowMode
  export let onClickFinishButton: () => void
  export let onClickCancelButton: () => void

  let selectedDefaultWindowMode = initialDefaultWindowMode

  const onCloseDialog = () => {
    // ダイアログを閉じる
    CurrentState.setDefaultWindowModeSettingDialog(null)
    CurrentState.commit()
  }

  const onClick = () => {
    doWithErrorCapture(() => {
      throw new Error('TODO: ラジオボタンをチェックする処理が未移植')

      // const selector = `input[type='radio'][name='defaultWindowMode'][value='${value}']`
      // const inputElement = document.querySelector<HTMLInputElement>(selector)
      // assertNonNull(inputElement)
      // inputElement.checked = true
    })
  }
</script>

<CommonDialog title="デフォルトウィンドウモード設定" {onCloseDialog}>
  <div class="default-window-mode-setting-dialog_content">
    <form class="default-window-mode-setting-dialog_option-list">
      <div class="default-window-mode-setting-dialog_option" on:click={onClick}>
        <input type="radio" bind:group={selectedDefaultWindowMode} value="keep" />
        指定なし
      </div>
      <div class="default-window-mode-setting-dialog_option" on:click={onClick}>
        <input type="radio" bind:group={selectedDefaultWindowMode} value="dual" />
        デュアルウィンドウモード
      </div>
      <div class="default-window-mode-setting-dialog_option" on:click={onClick}>
        <input type="radio" bind:group={selectedDefaultWindowMode} value="floating" />
        フローティングウィンドウモード
      </div>
      <div class="default-window-mode-setting-dialog_option" on:click={onClick}>
        <input type="radio" bind:group={selectedDefaultWindowMode} value="full" />
        フルウィンドウモード
      </div>
      <div class="default-window-mode-setting-dialog_option" on:click={onClick}>
        <input type="radio" bind:group={selectedDefaultWindowMode} value="inherit" />
        親ページの設定を継承
      </div>
    </form>
    <div class="default-window-mode-setting-dialog_button-area">
      <button on:click={onClickFinishButton}>完了</button>
      <button on:click={onClickCancelButton}>キャンセル</button>
    </div>
  </div>
</CommonDialog>

<style>
  .default-window-mode-setting-dialog_option-list {
    margin: 1em;
  }

  input[type='radio'] {
    margin: 0 3px 0 0;
  }

  /* デフォルトウィンドウモードの選択肢 */
  .default-window-mode-setting-dialog_option {
    display: flex;
    align-items: center;

    margin-top: 0.1em;

    font-size: 14px;

    cursor: pointer;
  }
  .default-window-mode-setting-dialog_option:first-child {
    margin-top: 0;
  }

  .default-window-mode-setting-dialog_button-area {
    /* ボタン群を右寄せにする */
    margin: 1em 1em 1em auto;
    width: max-content;
  }
</style>
