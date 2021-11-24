<script lang="ts">
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'
  import { CustomCssDialogProps } from 'src/TreeifyTab/View/Dialog/Preference/CustomCssDialogProps'

  export let props: CustomCssDialogProps

  let textContent: string = props.code

  function onKeyDown(event: KeyboardEvent) {
    switch (InputId.fromKeyboardEvent(event)) {
      case '1000Enter':
        props.onSubmit(textContent)
        break
    }
  }
</script>

<CommonDialog title="カスタムCSS">
  <div class="custom-css-dialog_content">
    <div
      class="custom-css-dialog_code"
      contenteditable="plaintext-only"
      tabindex="0"
      bind:textContent
      on:keydown={onKeyDown}
    >
      {props.code}
    </div>
    <div class="custom-css-dialog_button-area">
      <FinishAndCancelButtons
        onClickFinishButton={() => props.onSubmit(textContent)}
        onClickCancelButton={props.onClickCancelButton}
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
