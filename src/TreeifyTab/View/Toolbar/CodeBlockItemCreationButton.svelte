<script lang="ts">
  import {doWithErrorCapture} from '../../errorCapture'
  import {NullaryCommand} from '../../Internal/NullaryCommand'
  import {Rerenderer} from '../../Rerenderer'
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  function onClick() {
    doWithErrorCapture(() => {
      NullaryCommand.createEmptyCodeBlockItem()
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton on:click={onClick}>
  <div class="code-block-creation-button_icon" />
</ToolbarIconButton>

<style>
  :root {
    /* コードブロックアイテム作成ボタンのアイコンのサイズ（正方形の一辺の長さ） */
    --code-block-creation-button-icon-size: 18px;
  }

  /* コードブロックアイテム作成ボタンのアイコン */
  .code-block-creation-button_icon {
    width: var(--code-block-creation-button-icon-size);
    height: var(--code-block-creation-button-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: hsl(0, 0%, 40%);
    -webkit-mask: url('code-braces.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
</style>
