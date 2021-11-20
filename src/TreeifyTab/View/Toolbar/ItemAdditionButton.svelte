<script lang="ts">
  import { doWithErrorCapture } from 'src/TreeifyTab/errorCapture'
  import { External } from 'src/TreeifyTab/External/External'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'

  function onClick() {
    doWithErrorCapture(() => {
      External.instance.dialogState = { type: 'ItemAdditionDropdownMenuDialog' }
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton title="項目を追加" on:click={onClick}>
  <div class="item-addition-button_icon" />
</ToolbarIconButton>

<style global lang="scss">
  .item-addition-button_icon {
    width: 24px;
    aspect-ratio: 1;

    // 中央寄せ
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    // lch(45.0%, 0.0, 0.0)相当
    background: #6a6a6a;
    -webkit-mask: url('plus-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
