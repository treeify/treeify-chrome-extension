<script lang="ts">
  import CommonDialog from './CommonDialog.svelte'
  import {OtherSettingsDialogProps} from './OtherSettingsDialogProps'

  export let props: OtherSettingsDialogProps
</script>

<CommonDialog title="その他の設定">
  <div class="other-settings-dialog_content" tabindex="0">
    <label class="other-settings-dialog_checkbox-label"
      ><input
        type="checkbox"
        checked={props.leftEndMouseGestureEnabled}
        on:change={props.onChangeLeftEndMouseGestureEnabled}
      />ウェブページ閲覧中にマウスを画面左端まで動かすとTreeifyタブを表示する</label
    >
  </div>
</CommonDialog>

<style global lang="scss">
  .other-settings-dialog_content {
    padding: 1em;

    outline: none;
  }
</style>
