<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'

  let textContent: string = Internal.instance.state.customCss

  function onKeyDown(event: KeyboardEvent) {
    switch (InputId.fromKeyboardEvent(event)) {
      case '1000Enter':
        event.preventDefault()
        onSubmit(textContent)
        break
    }
  }

  function onSubmit(newCode: string) {
    Internal.instance.mutate(newCode, PropertyPath.of('customCss'))

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickCancelButton() {
    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }
</script>

<CommonDialog class="custom-css-dialog_root" title="カスタムCSS">
  <div class="custom-css-dialog_content">
    <div
      class="custom-css-dialog_code"
      contenteditable="plaintext-only"
      tabindex="0"
      bind:textContent
      on:keydown={onKeyDown}
    />
    <div class="custom-css-dialog_button-area">
      <FinishAndCancelButtons
        onClickFinishButton={() => onSubmit(textContent)}
        {onClickCancelButton}
      />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .custom-css-dialog_content {
    padding: 1em;

    max-height: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .custom-css-dialog_code {
    min-width: 50vw;
    min-height: 50vh;
    padding: 0.5em;

    // lch(60.0%, 0.0, 0.0)相当
    outline: 1px solid #919191;

    max-height: 100%;
    overflow-y: auto;
  }

  .custom-css-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
