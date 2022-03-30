<script lang="ts">
  import { onCopy, onCut, onPaste } from 'src/TreeifyTab/Internal/ImportExport/clipboard'
  import { onResizeImage } from 'src/TreeifyTab/View/dragAndDrop'
  import MainAreaNode from 'src/TreeifyTab/View/MainArea/MainAreaNode.svelte'
  import { MainAreaProps } from 'src/TreeifyTab/View/MainArea/MainAreaProps'

  export let props: MainAreaProps
</script>

<main
  class="main-area_root"
  tabindex="0"
  on:keydown={props.onKeyDown}
  on:copy={onCopy}
  on:cut={onCut}
  on:paste={onPaste}
  use:onResizeImage={props.onResizeImage}
>
  <div class="main-area_paper">
    {#key props.rootNodeProps.itemPath.toString()}
      <MainAreaNode props={props.rootNodeProps} />
    {/key}
  </div>
</main>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // メインエリアのテキスト全般に適用されるline-height。
    // 階層が深くなるごとにフォントサイズなどが小さくなる仕組みを実現するために比率で指定しなければならない。
    --main-area-line-height: #{common.toIntegerPx(1.45em)};

    // フォントサイズをline-height（比率指定）を乗算して、行の高さを算出する
    --main-area-calculated-line-height: calc(
      var(--main-area-line-height) + 2 * var(--main-area-node-content-area-vertical-padding)
    );

    --main-area-max-width: 1200px;
  }

  .main-area_root {
    overflow-y: auto;

    line-height: var(--main-area-line-height);

    outline: none;

    background: oklch(97% 0 0);
  }

  .main-area_paper {
    padding-inline: 32px;
    padding-top: 24px;
    padding-bottom: 25vh;
    border-radius: 10px 10px 0 0;

    margin-inline: 40px;
    margin-top: 30px;

    // アウトライン表示の横幅が長すぎると右端のaudibleアイコンやタブ数カウントボタンが遠すぎてあまり役に立たなくなるので横幅を制限
    max-width: var(--main-area-max-width);

    min-height: 100%;

    box-shadow: 0 0.5px 3px oklch(70% 0 0);

    background: oklch(100% 0 0);

    @media print {
      box-shadow: none;
      margin: 0;
      border-radius: 0;
    }
  }
</style>
