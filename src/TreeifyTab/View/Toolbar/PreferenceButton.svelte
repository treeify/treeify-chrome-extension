<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'

  function onClick() {
    External.instance.dialogState = { type: 'PreferenceDropdownMenuDialog' }
    Rerenderer.instance.rerender()
  }
</script>

<ToolbarIconButton title="環境設定" on:click={onClick}>
  <div class="preference-button_icon" />
</ToolbarIconButton>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .preference-button_icon {
    @include common.square(22px);

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
