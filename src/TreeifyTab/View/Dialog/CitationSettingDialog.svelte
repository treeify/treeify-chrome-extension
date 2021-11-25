<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'

  const targetItemPath = CurrentState.getTargetItemPath()
  const item = Internal.instance.state.items[ItemPath.getItemId(targetItemPath)]

  let titleValue: string = item.cite?.title ?? ''
  let urlValue: string = item.cite?.url ?? ''

  function onClickFinishButton() {
    const targetItemId = ItemPath.getItemId(targetItemPath)

    // citeプロパティを更新
    CurrentState.setCite(targetItemId, { title: titleValue, url: urlValue })

    // タイムスタンプを更新
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

<CommonDialog title="出典設定">
  <div class="citation-setting-dialog_content" on:keydown={onKeyDown}>
    <div class="citation-setting-dialog_input-area">
      <label>タイトル（省略可）</label>
      <input type="text" class="citation-setting-dialog_cite-title" bind:value={titleValue} />
      <label>URL（省略可）</label>
      <input type="url" class="citation-setting-dialog_cite-url" bind:value={urlValue} />
    </div>
    <div class="citation-setting-dialog_button-area">
      <FinishAndCancelButtons {onClickFinishButton} {onClickCancelButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .citation-setting-dialog_content {
    width: 90vw;
    max-width: 40em;
    padding: 1em;
  }

  .citation-setting-dialog_input-area {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-gap: 0.5em;
  }

  .citation-setting-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
