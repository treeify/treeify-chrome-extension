<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'

  function onClick(event: MouseEvent) {
    event.preventDefault()
    External.instance.dialogState = { type: 'PreferenceDropdownMenuDialog' }
    Rerenderer.instance.rerender()
  }
</script>

<ToolbarIconButton class="preference-button_root" title="環境設定" on:mousedown={onClick}>
  <div class="preference-button_icon" />
</ToolbarIconButton>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .preference-button_icon {
    @include common.square(24px);
    @include common.absolute-center;

    // lch(45.0%, 0.0, 0.0)相当
    @include common.icon(#6a6a6a, url('gear.svg'));
  }
</style>
