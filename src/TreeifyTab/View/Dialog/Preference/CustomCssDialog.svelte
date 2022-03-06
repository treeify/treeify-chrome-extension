<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import PrimaryAndSecondaryButtons from 'src/TreeifyTab/View/Dialog/PrimaryAndSecondaryButtons.svelte'

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
    Internal.instance.mutate(newCode, StatePath.of('customCss'))

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickSecondaryButton() {
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
    <div class="custom-css-dialog_bottom-button-area">
      <PrimaryAndSecondaryButtons
        onClickPrimaryButton={() => onSubmit(textContent)}
        {onClickSecondaryButton}
      />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .custom-css-dialog_content {
    padding: common.em(1);

    max-height: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .custom-css-dialog_code {
    min-width: 50vw;
    min-height: 50vh;
    padding: common.em(0.5);

    outline: 1px solid lch(60% 0 0);

    max-height: 100%;
    overflow-y: auto;
  }

  .custom-css-dialog_bottom-button-area {
    @include common.flex-right;

    margin-top: common.em(1);
  }
</style>
