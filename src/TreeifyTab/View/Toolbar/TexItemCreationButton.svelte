<script lang="ts">
  import {doWithErrorCapture} from '../../errorCapture'
  import {NullaryCommand} from '../../Internal/NullaryCommand'
  import {Rerenderer} from '../../Rerenderer'
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  function onClick() {
    doWithErrorCapture(() => {
      NullaryCommand.createEmptyTexItem()
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton on:click={onClick}>
  <div class="tex-item-creation-button_icon" />
</ToolbarIconButton>

<style>
  :root {
    /* TeXアイテム作成ボタンのアイコンのサイズ（正方形の一辺の長さ） */
    --tex-item-creation-button-icon-size: 18px;
  }

  /* TeXアイテム作成ボタンのアイコン */
  .tex-item-creation-button_icon {
    width: var(--tex-item-creation-button-icon-size);
    height: var(--tex-item-creation-button-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* lch(40.0%, 0.0, 0.0)相当 */
    background: #5e5e5e;
    -webkit-mask: url('math-formula-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
