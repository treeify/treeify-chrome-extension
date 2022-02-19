<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import PrimaryAndSecondaryButtons from 'src/TreeifyTab/View/Dialog/PrimaryAndSecondaryButtons.svelte'

  const targetItemPath = CurrentState.getTargetItemPath()
  const item = Internal.instance.state.items[ItemPath.getItemId(targetItemPath)]

  let titleValue: string = item.source?.title ?? ''
  let urlValue: string = item.source?.url ?? ''

  function onClickPrimaryButton() {
    const targetItemId = ItemPath.getItemId(targetItemPath)

    // sourceプロパティを更新
    CurrentState.setSource(targetItemId, { title: titleValue, url: urlValue })

    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(targetItemId)

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickSecondaryButton() {
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
        onClickPrimaryButton()
        break
    }
  }
</script>

<CommonDialog class="source-edit-dialog_root" title="出典編集">
  <div class="source-edit-dialog_content" on:keydown={onKeyDown}>
    <div class="source-edit-dialog_input-area">
      <label class="source-edit-dialog_label">
        タイトル（省略可）
        <input type="text" class="source-edit-dialog_source-title" bind:value={titleValue} />
      </label>
      <label class="source-edit-dialog_label">
        URL（省略可）
        <input type="url" class="source-edit-dialog_source-url" bind:value={urlValue} />
      </label>
    </div>
    <div class="source-edit-dialog_button-area">
      <PrimaryAndSecondaryButtons {onClickPrimaryButton} {onClickSecondaryButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .source-edit-dialog_content {
    width: 90vw;
    max-width: 40em;
    padding: 1em;
  }

  .source-edit-dialog_input-area {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-gap: 0.5em;
  }

  .source-edit-dialog_label {
    display: contents;
  }

  .source-edit-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
