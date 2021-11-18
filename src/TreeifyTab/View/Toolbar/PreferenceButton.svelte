<script lang="ts">
  import { doWithErrorCapture } from '../../errorCapture'
  import { External } from '../../External/External'
  import { Rerenderer } from '../../Rerenderer'
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  function onClick() {
    doWithErrorCapture(() => {
      External.instance.dialogState = { type: 'PreferenceDropdownMenuDialog' }
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton title="環境設定" on:click={onClick}>
  <div class="preference-button_icon" />
</ToolbarIconButton>

<style global lang="scss">
  .preference-button_icon {
    width: 22px;
    aspect-ratio: 1;

    // 中央寄せ
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    // lch(45.0%, 0.0, 0.0)相当
    background: #6a6a6a;
    -webkit-mask: url('gear-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
