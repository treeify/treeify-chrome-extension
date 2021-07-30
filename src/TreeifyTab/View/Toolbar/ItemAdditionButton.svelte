<script lang="ts">
  import {doWithErrorCapture} from '../../errorCapture'
  import {External} from '../../External/External'
  import {Rerenderer} from '../../Rerenderer'
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  function onClick() {
    doWithErrorCapture(() => {
      External.instance.dialogState = {type: 'ItemAdditionDropdownMenuDialog'}
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton title="項目を追加" on:click={onClick}>
  <div class="item-addition-button_icon" />
</ToolbarIconButton>

<style global lang="scss">
  .item-addition-button_icon {
    --icon-size: 24px;
    width: var(--icon-size);
    height: var(--icon-size);

    // 中央寄せ
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    // lch(40.0%, 0.0, 0.0)相当
    background: #777777;
    -webkit-mask: url('plus-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
