<script lang="ts">
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {ItemPath} from '../../Internal/ItemPath'
  import {DefaultWindowMode, DefaultWindowModeSettingDialog} from '../../Internal/State'
  import {Rerenderer} from '../../Rerenderer'
  import CommonDialog from './CommonDialog.svelte'

  type DefaultWindowModeSettingDialogViewModel = DefaultWindowModeSettingDialog & {
    initialDefaultWindowMode: DefaultWindowMode
    onClickCancelButton: () => void
  }

  export let viewModel: DefaultWindowModeSettingDialogViewModel

  let selectedDefaultWindowMode = viewModel.initialDefaultWindowMode

  const onCloseDialog = () => {
    // ダイアログを閉じる
    CurrentState.setDefaultWindowModeSettingDialog(null)
    Rerenderer.instance.rerender()
  }

  const onClick = (event: Event) => {
    doWithErrorCapture(() => {
      if (event.target instanceof HTMLElement) {
        const inputElement = event.target.querySelector("input[type='radio']")
        if (inputElement instanceof HTMLInputElement) {
          // inputElement.checked = true ではbind:groupをすり抜けてしまう模様
          inputElement.click()
        }
      }
    })
  }

  const onClickFinishButton = () => {
    const targetItemPath = CurrentState.getTargetItemPath()
    const targetItemId = ItemPath.getItemId(targetItemPath)
    const targetPageId = CurrentState.isPage(targetItemId)
      ? targetItemId
      : ItemPath.getRootItemId(targetItemPath)

    // デフォルトウィンドウモードを更新
    CurrentState.setDefaultWindowMode(targetPageId, selectedDefaultWindowMode)

    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(targetPageId)

    // ダイアログを閉じる
    CurrentState.setDefaultWindowModeSettingDialog(null)
    Rerenderer.instance.rerender()
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
      <button on:click={viewModel.onClickCancelButton}>キャンセル</button>
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
