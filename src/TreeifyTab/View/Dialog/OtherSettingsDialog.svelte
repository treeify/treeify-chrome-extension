<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import Checkbox from 'src/TreeifyTab/View/Checkbox.svelte'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'

  let leftEndMouseGestureEnabled = Internal.instance.state.leftEndMouseGestureEnabled
  let rightEndMouseGestureEnabled = Internal.instance.state.rightEndMouseGestureEnabled
  let useClipboardTextWhenQuoting = Internal.instance.state.useClipboardTextWhenQuoting

  $: Internal.instance.mutate(
    leftEndMouseGestureEnabled,
    StatePath.of('leftEndMouseGestureEnabled')
  )

  $: Internal.instance.mutate(
    rightEndMouseGestureEnabled,
    StatePath.of('rightEndMouseGestureEnabled')
  )

  $: Internal.instance.mutate(
    useClipboardTextWhenQuoting,
    StatePath.of('useClipboardTextWhenQuoting')
  )

  function closeDialog() {
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }
</script>

<CommonDialog class="other-settings-dialog_root" title="その他の設定">
  <div class="other-settings-dialog_content" tabindex="0">
    <div class="other-settings-dialog_checkbox-area">
      <Checkbox bind:checked={leftEndMouseGestureEnabled}>
        マウスを画面左端まで動かすとTreeifyタブを表示
      </Checkbox>
      <Checkbox bind:checked={rightEndMouseGestureEnabled}>
        マウスを画面右端まで動かすとタブを閉じてTreeifyタブを表示
      </Checkbox>
      <Checkbox bind:checked={useClipboardTextWhenQuoting}>
        テキストをコピーしてから引用したら改行を維持
      </Checkbox>
    </div>
    <div class="other-settings-dialog_bottom-button-area">
      <button
        class="other-settings-dialog_ok-button primary"
        on:mousedown|preventDefault={closeDialog}
      >
        OK
      </button>
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .other-settings-dialog_content {
    padding: common.toIntegerPx(1em);

    outline: none;

    max-height: 100%;
    overflow-y: auto;
  }

  .other-settings-dialog_checkbox-area {
    display: inline-flex;
    flex-direction: column;
    gap: common.toIntegerPx(0.5em);

    margin-top: common.toIntegerPx(0.5em);
  }

  .other-settings-dialog_spacer {
    height: common.toIntegerPx(1em);
  }

  .other-settings-dialog_bottom-button-area {
    @include common.flex-right;

    margin-top: common.toIntegerPx(1em);
  }
</style>
