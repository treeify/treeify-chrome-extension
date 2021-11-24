<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import { OtherSettingsDialogProps } from 'src/TreeifyTab/View/Dialog/OtherSettingsDialogProps'

  export let props: OtherSettingsDialogProps

  function closeDialog() {
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }
</script>

<CommonDialog title="その他の設定">
  <div class="other-settings-dialog_content" tabindex="0">
    <label class="other-settings-dialog_checkbox-label">
      <input
        type="checkbox"
        checked={props.leftEndMouseGestureEnabled}
        on:change={props.onChangeLeftEndMouseGestureEnabled}
      />
      マウスを画面左端まで動かすとTreeifyタブを表示
    </label>
    <label class="other-settings-dialog_checkbox-label">
      <input
        type="checkbox"
        checked={props.rightEndMouseGestureEnabled}
        on:change={props.onChangeRightEndMouseGestureEnabled}
      />
      マウスを画面右端まで動かすとタブを閉じてTreeifyタブを表示
    </label>
    <div class="other-settings-dialog_button-area">
      <button on:click={closeDialog}>OK</button>
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .other-settings-dialog_content {
    padding: 1em;

    outline: none;

    max-height: 100%;
    overflow-y: auto;
  }

  .other-settings-dialog_checkbox-label {
    display: flex;
    align-items: center;

    cursor: pointer;
  }

  .other-settings-dialog_button-area {
    // ボタンを右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
