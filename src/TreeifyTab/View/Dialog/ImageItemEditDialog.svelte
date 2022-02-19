<script lang="ts">
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
  const isEmptyImageItem = CurrentState.isEmptyImageItem(targetItemId)

  let url = Internal.instance.state.imageItems[targetItemId].url

  function onKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return

    switch (InputId.fromKeyboardEvent(event)) {
      case '0000Enter':
      case '1000Enter':
        event.preventDefault()
        onClickPrimaryButton()
        break
    }
  }

  function onClickPrimaryButton() {
    // URLを更新
    CurrentState.setImageItemUrl(targetItemId, url)
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

  function onCloseDialog() {
    if (CurrentState.isEmptyImageItem(targetItemId)) {
      Command.removeItem()
    }
  }
</script>

<CommonDialog
  class="image-item-edit-dialog_root"
  title={isEmptyImageItem ? '画像項目作成' : '画像項目編集'}
  onClose={onCloseDialog}
>
  <div class="image-item-edit-dialog_content" on:keydown={onKeyDown}>
    <input
      type="text"
      class="image-item-edit-dialog_url"
      bind:value={url}
      placeholder="https://example.com/image.png"
    />
    <div class="image-item-edit-dialog_button-area">
      <PrimaryAndSecondaryButtons
        primaryButtonText={isEmptyImageItem ? '作成' : undefined}
        {onClickPrimaryButton}
        {onClickSecondaryButton}
      />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .image-item-edit-dialog_content {
    min-width: 45em;
    padding: 1em;
  }

  .image-item-edit-dialog_url {
    width: 100%;
  }

  .image-item-edit-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
