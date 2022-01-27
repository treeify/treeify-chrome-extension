<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'

  let leftEndMouseGestureEnabled = Internal.instance.state.leftEndMouseGestureEnabled
  let rightEndMouseGestureEnabled = Internal.instance.state.rightEndMouseGestureEnabled

  $: Internal.instance.mutate(
    leftEndMouseGestureEnabled,
    StatePath.of('leftEndMouseGestureEnabled')
  )

  $: Internal.instance.mutate(
    rightEndMouseGestureEnabled,
    StatePath.of('rightEndMouseGestureEnabled')
  )

  function closeDialog() {
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }
</script>

<CommonDialog class="other-settings-dialog_root" title="その他の設定">
  <div class="other-settings-dialog_content" tabindex="0">
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
