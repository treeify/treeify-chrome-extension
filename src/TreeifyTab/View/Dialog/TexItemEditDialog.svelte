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
  import PrimaryAndSecondaryButtons from 'src/TreeifyTab/View/Dialog/PrimaryAndSecondaryButtons.svelte'

  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const isEmptyTexItem = CurrentState.isEmptyTexItem(targetItemId)
  let code = Internal.instance.state.texItems[targetItemId].code

  function onClickPrimaryButton() {
    // コードを更新
    CurrentState.setTexItemCode(targetItemId, code)
    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(targetItemId)

    onCloseDialog()

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickSecondaryButton() {
    // ダイアログを閉じる
    External.instance.dialogState = undefined
    onCloseDialog()
    Rerenderer.instance.rerender()
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (InputId.fromKeyboardEvent(event)) {
      case '1000Enter':
        event.preventDefault()
        onClickPrimaryButton()
        break
    }
  }

  function onCloseDialog() {
    if (CurrentState.isEmptyTexItem(targetItemId)) {
      Command.removeItem()
    }
  }
</script>

<CommonDialog
  class="tex-edit-dialog_root"
  title={isEmptyTexItem ? 'TeX項目作成' : 'TeX編集'}
  onClose={onCloseDialog}
>
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
    <div class="tex-edit-dialog_bottom-button-area">
      <PrimaryAndSecondaryButtons
        primaryButtonText={isEmptyTexItem ? '作成' : undefined}
        {onClickPrimaryButton}
        {onClickSecondaryButton}
      />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .tex-edit-dialog_content {
    min-width: common.toIntegerPx(24em);
    padding: common.toIntegerPx(1em);

    max-height: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .tex-edit-dialog_scroll-area {
    overflow-y: auto;
  }

  .tex-edit-dialog_code {
    padding: common.toIntegerPx(0.5em);

    $outline-size: 1px;
    outline: $outline-size solid lch(60% 0 0);
    // 親要素によってoutlineが見えなくなってしまう現象へのワークアラウンド。
    margin: $outline-size;
  }

  .tex-edit-dialog_rendered-tex {
    margin-top: common.toIntegerPx(1em);
    // なぜか縦スクロールバーが出る不具合の対策（KaTeXの複雑なDOMレイアウトの影響でサイズ計算が普通じゃないのだろうか）
    margin-bottom: common.toIntegerPx(0.3em);

    // 左端が切れてしまうことがある不具合の対策
    margin-inline: common.toIntegerPx(0.4em);
  }

  .tex-edit-dialog_bottom-button-area {
    @include common.flex-right;

    margin-top: common.toIntegerPx(1em);
  }
</style>
