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

<style global>
  :root {
    /* 項目追加設定ボタンのアイコンのサイズ（正方形の一辺の長さ） */
    --item-addition-button-icon-size: 22px;
  }

  .item-addition-button_icon {
    width: var(--item-addition-button-icon-size);
    height: var(--item-addition-button-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* lch(40.0%, 0.0, 0.0)相当 */
    background: #5e5e5e;
    -webkit-mask: url('plus-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
