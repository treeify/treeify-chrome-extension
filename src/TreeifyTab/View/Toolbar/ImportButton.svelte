<script lang="ts">
  import {doWithErrorCapture} from '../../errorCapture'
  import {Rerenderer} from '../../Rerenderer'
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  function onClick() {
    doWithErrorCapture(() => {
      // TODO: 実装

      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton on:click={onClick}>
  <div class="import-button_icon" />
</ToolbarIconButton>

<style>
  :root {
    /* インポートボタンのアイコンのサイズ（正方形の一辺の長さ） */
    --import-button-icon-size: 22px;
  }

  .import-button_icon {
    width: var(--import-button-icon-size);
    height: var(--import-button-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* lch(40.0%, 0.0, 0.0)相当 */
    background: #5e5e5e;
    -webkit-mask: url('import-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
