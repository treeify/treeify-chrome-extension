<script lang="ts">
  import katex from 'katex'
  import { External } from 'src/TreeifyTab/External/External'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'

  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const isEmptyTexItem = CurrentState.isEmptyTexItem(targetItemId)
  const dialogTitle = isEmptyTexItem ? 'TeX項目作成' : 'TeX編集'
  let code = Internal.instance.state.texItems[targetItemId].code

  function onClickFinishButton() {
    // コードを更新
    CurrentState.setTexItemCode(targetItemId, code)
    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(targetItemId)

    onCloseDialog()

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickCancelButton() {
    // ダイアログを閉じる
    External.instance.dialogState = undefined
    onCloseDialog()
    Rerenderer.instance.rerender()
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (InputId.fromKeyboardEvent(event)) {
      case '1000Enter':
        event.preventDefault()
        onClickFinishButton()
        break
    }
  }

  function onCloseDialog() {
    if (CurrentState.isEmptyTexItem(targetItemId)) {
      Command.removeItem()
    }
  }
</script>

<CommonDialog class="tex-edit-dialog_root" title={dialogTitle} onClose={onCloseDialog}>
  <div class="tex-edit-dialog_content" on:keydown={onKeyDown}>
    <div class="tex-edit-dialog_scroll-area">
      <div
        class="tex-edit-dialog_code"
        contenteditable="plaintext-only"
        tabindex="0"
        bind:textContent={code}
      />
      <div class="tex-edit-dialog_rendered-tex">
        {@html katex.renderToString(code, { throwOnError: false })}
      </div>
    </div>
    <div class="tex-edit-dialog_button-area">
      <FinishAndCancelButtons {onClickFinishButton} {onClickCancelButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .tex-edit-dialog_content {
    min-width: 20em;
    padding: 1em;

    max-height: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .tex-edit-dialog_scroll-area {
    max-height: 100%;
    overflow-y: auto;
  }

  .tex-edit-dialog_code {
    padding: 0.5em;

    $outline-size: 1px;
    // lch(60.0%, 0.0, 0.0)相当
    outline: $outline-size solid #919191;
    // 親要素によってoutlineが見えなくなってしまう現象へのワークアラウンド。
    margin: $outline-size;
  }

  .tex-edit-dialog_rendered-tex {
    margin-top: 1em;
  }

  .tex-edit-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
