<script lang="ts">
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {Rerenderer} from '../../Rerenderer'
  import ToolbarIconButton from './ToolbarIconButton.svelte'
  
  function onClick() {
    doWithErrorCapture(() => {
      CurrentState.setDialog({type: 'PreferenceDialog'})
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton title="環境設定" on:click={onClick}>
  <div class="preference-button_icon" />
</ToolbarIconButton>

<style>
  :root {
    /* 環境設定ボタンのアイコンのサイズ（正方形の一辺の長さ） */
    --preference-button-icon-size: 18px;
  }

  .preference-button_icon {
    width: var(--preference-button-icon-size);
    height: var(--preference-button-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* lch(40.0%, 0.0, 0.0)相当 */
    background: #5e5e5e;
    -webkit-mask: url('gear-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
