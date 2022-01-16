<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'

  function onClick(event: MouseEvent) {
    event.preventDefault()
    External.instance.dialogState = { type: 'ItemAdditionDropdownMenuDialog' }
    Rerenderer.instance.rerender()
  }
</script>

<ToolbarIconButton class="item-addition-button_root" title="項目を追加" on:mousedown={onClick}>
  <div class="item-addition-button_icon" />
</ToolbarIconButton>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .item-addition-button_icon {
    @include common.square(24px);
    @include common.absolute-center;

    // lch(45.0%, 0.0, 0.0)相当
    @include common.icon(#6a6a6a, url('plus.svg'));
  }
</style>
