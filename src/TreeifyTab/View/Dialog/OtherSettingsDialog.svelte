<script lang="ts">
  import CommonDialog from './CommonDialog.svelte'
  import { OtherSettingsDialogProps } from './OtherSettingsDialogProps'

  export let props: OtherSettingsDialogProps
</script>

<CommonDialog title="その他の設定" showCloseButton>
  <div class="other-settings-dialog_content" tabindex="0">
    <label class="other-settings-dialog_checkbox-label"
      ><input
        type="checkbox"
        checked={props.leftEndMouseGestureEnabled}
        on:change={props.onChangeLeftEndMouseGestureEnabled}
      />マウスを画面左端まで動かすとTreeifyタブを表示</label
    >
    <label class="other-settings-dialog_checkbox-label"
      ><input
        type="checkbox"
        checked={props.rightEndMouseGestureEnabled}
        on:change={props.onChangeRightEndMouseGestureEnabled}
      />マウスを画面右端まで動かすとタブを閉じてTreeifyタブを表示</label
    >
  </div>
</CommonDialog>

<style global lang="scss">
  .other-settings-dialog_content {
    padding: 1em;

    outline: none;
  }

  .other-settings-dialog_checkbox-label {
    display: block;

    cursor: pointer;
  }
</style>
