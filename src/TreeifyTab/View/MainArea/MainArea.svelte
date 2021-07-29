<script lang="ts">
  import {onCopy, onCut, onPaste} from '../../Internal/ImportExport/clipboard'
  import {onDragImageBottom} from '../dragAndDrop'
  import MainAreaNode from './MainAreaNode.svelte'
  import {MainAreaProps} from './MainAreaProps'

  export let props: MainAreaProps
</script>

<main
  class="main-area"
  tabindex="0"
  on:keydown={props.onKeyDown}
  on:copy={onCopy}
  on:cut={onCut}
  on:paste={onPaste}
  use:onDragImageBottom={props.onDragImageBottom}
>
  <div class="main-area_paper">
    {#key props.rootNodeProps.itemPath.toString()}
      <MainAreaNode props={props.rootNodeProps} />
    {/key}
  </div>
</main>

<style global lang="scss">
  :root {
    /*
    メインエリアのテキスト全般に適用されるline-height。
    階層が深くなるごとにフォントサイズなどが小さくなる仕組みを実現するために比率で指定しなければならない。
    */
    --main-area-line-height: 1.3;

    /* フォントサイズをline-height（比率指定）を乗算して、行の高さを算出する */
    --main-area-calculated-line-height: calc(
      1em * var(--main-area-line-height) + var(--main-area-body-area-vertical-padding)
    );
  }

  .main-area {
    overflow-y: auto;

    line-height: var(--main-area-line-height);

    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;

    // lch(97.0%, 0.0, 0.0)相当
    background: #f6f6f6;
  }

  .main-area_paper {
    margin: 20px 270px 40vh 40px;
    padding-block: 20px;
    padding-inline: 30px;
    border-radius: 10px;

    /* lch(80.0%, 0.0, 0.0)相当 */
    box-shadow: 0 1.5px 5px #c6c6c6;

    background: #ffffff;
  }
</style>
