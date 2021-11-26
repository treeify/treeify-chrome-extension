<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'
  import { assertNonUndefined } from 'src/Utility/Debug/assert'

  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const caption = CurrentState.getCaption(targetItemId)
  assertNonUndefined(caption)

  let captionValue: string = caption

  function onClickFinishButton() {
    const targetItemPath = CurrentState.getTargetItemPath()
    const targetItemId = ItemPath.getItemId(targetItemPath)

    CurrentState.setCaption(targetItemId, captionValue)
    CurrentState.updateItemTimestamp(targetItemId)

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickCancelButton() {
    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return

    switch (InputId.fromKeyboardEvent(event)) {
      case '0000Enter':
      case '1000Enter':
        event.preventDefault()
        onClickFinishButton()
        break
    }
  }
</script>

<CommonDialog title="キャプション設定">
  <div class="caption-setting-dialog_content" on:keydown={onKeyDown}>
    <input type="text" class="caption-setting-dialog_caption" bind:value={captionValue} />
    <div class="caption-setting-dialog_button-area">
      <FinishAndCancelButtons {onClickFinishButton} {onClickCancelButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .caption-setting-dialog_content {
    min-width: 20em;
    padding: 1em;
  }

  .caption-setting-dialog_caption {
    width: 100%;
  }

  .caption-setting-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
