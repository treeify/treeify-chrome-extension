<script lang="ts">
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { CitationSettingDialogProps } from 'src/TreeifyTab/View/Dialog/CitationSettingDialogProps'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'

  export let props: CitationSettingDialogProps

  let titleValue: string = props.title
  let urlValue: string = props.url

  function onKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return

    switch (InputId.fromKeyboardEvent(event)) {
      case '0000Enter':
      case '1000Enter':
        event.preventDefault()
        props.onSubmit(titleValue, urlValue)
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
      <FinishAndCancelButtons
        onClickFinishButton={() => props.onSubmit(titleValue, urlValue)}
        onClickCancelButton={props.onClickCancelButton}
      />
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
