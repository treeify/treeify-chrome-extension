<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'

  let syncWith = Internal.instance.state.syncWith
  let leftEndMouseGestureEnabled = Internal.instance.state.leftEndMouseGestureEnabled
  let rightEndMouseGestureEnabled = Internal.instance.state.rightEndMouseGestureEnabled

  $: Internal.instance.mutate(syncWith, PropertyPath.of('syncWith'))

  $: Internal.instance.mutate(
    leftEndMouseGestureEnabled,
    PropertyPath.of('leftEndMouseGestureEnabled')
  )

  $: Internal.instance.mutate(
    rightEndMouseGestureEnabled,
    PropertyPath.of('rightEndMouseGestureEnabled')
  )

  function closeDialog() {
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }
</script>

<CommonDialog title="その他の設定">
  <div class="other-settings-dialog_content" tabindex="0">
    <fieldset class="other-settings-dialog_sync-with-area">
      <legend>データの同期先</legend>
      <div class="other-settings-dialog_sync-with-options">
        <label class="other-settings-dialog_radio-button-label">
          <input type="radio" bind:group={syncWith} value="Google Drive" />
          Google Drive
        </label>
        <label class="other-settings-dialog_radio-button-label">
          <input type="radio" bind:group={syncWith} value="Local" />
          ローカル（データフォルダ）
        </label>
      </div>
    </fieldset>
    <div class="other-settings-dialog_spacer" />
    <label class="other-settings-dialog_checkbox-label">
      <input type="checkbox" bind:checked={leftEndMouseGestureEnabled} />
      マウスを画面左端まで動かすとTreeifyタブを表示
    </label>
    <label class="other-settings-dialog_checkbox-label">
      <input type="checkbox" bind:checked={rightEndMouseGestureEnabled} />
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

  .other-settings-dialog_sync-with-area {
    // lch(80.0%, 0.0, 0.0)相当
    border: #c6c6c6 1px solid;
  }

  .other-settings-dialog_sync-with-options {
    display: flex;
    flex-direction: column;
    gap: 0.1em;
  }

  .other-settings-dialog_radio-button-label {
    display: flex;
    align-items: center;
    gap: 0.35em;

    input[type='radio'] {
      margin: 0;
    }
  }

  .other-settings-dialog_checkbox-label {
    display: flex;
    align-items: center;
  }

  .other-settings-dialog_spacer {
    height: 1em;
  }

  .other-settings-dialog_button-area {
    // ボタンを右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
