<script lang="ts">
  import {Internal} from 'src/TreeifyTab/Internal/Internal'
  import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
  import {createRootProps, RootProps} from 'src/TreeifyTab/View/RootProps'
  import {derived, Readable} from 'svelte/store'
  import DialogLayer from './Dialog/DialogLayer.svelte'
  import {dragStateResetter} from './dragAndDrop'
  import DragImage from './DragImage.svelte'
  import LeftSidebar from './LeftSidebar/LeftSidebar.svelte'
  import MainArea from './MainArea/MainArea.svelte'
  import Toolbar from './Toolbar/Toolbar.svelte'

  const propsStream: Readable<RootProps> = derived(Rerenderer.instance.rerenderingPulse, () => {
    return createRootProps(Internal.instance.state)
  })
  $: props = $propsStream
</script>

<div class="root" use:dragStateResetter>
  <!--
  カスタムCSSを埋め込む。
  Svelteは動的にstyle要素をhead要素の子リスト末尾に追加するので、尋常な方法ではCSSの優先度で負けてしまう。
  body要素の下にstyle要素を入れることで優先度の問題を解決した。
  またSvelteでは<style>{css}</style>のように書いても動的にCSSを設定できないので、innerHTMLの形で強引に埋め込む。
  -->
  {@html props.customCssHtml}
  <div class="toolbar-and-sidebar-layout">
    <Toolbar props={props.toolbarProps} />
    <div class="sidebar-layout">
      <LeftSidebar props={props.leftSidebarProps} />
      <MainArea props={props.mainAreaProps} />
    </div>
  </div>
  <DialogLayer props={props.dialogLayerProps} />
  {#if props.dragImageProps !== undefined}
    <DragImage props={props.dragImageProps} />
  {/if}
</div>

<style global lang="scss">
  * {
    box-sizing: border-box;
  }

  html {
    height: 100%;
    font-size: 15px;
  }

  body {
    -webkit-print-color-adjust: exact;

    height: 100%;
    margin: 0;
    font-size: inherit;
  }

  img {
    vertical-align: top;
  }

  .spa-root {
    height: 100%;
  }

  .root {
    height: 100%;
    // ダイアログなどを他の表示物に重ねて表示するための設定
    position: relative;
  }

  // ツールバーとその他の領域を縦に並べるためのレイアウト
  .toolbar-and-sidebar-layout {
    // スクロールされてもツールバーを常に画面上部に表示し続けるための設定
    height: 100%;

    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
  }

  // 左サイドバーとメインエリアを横に並べるレイアウト
  .sidebar-layout {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .default-favicon {
    // lch(40.0%, 0.0, 0.0)相当
    background: #5e5e5e;
    -webkit-mask-image: url('./default-favicon.svg');
  }

  /*
  アイコンのみ（テキストなし）の円形ボタンの共通クラス。
  マウスホバー時の背景色変化と押下時の疑似リップルエフェクトが実装されている。
  */
  .icon-button {
    border-radius: 50%;

    cursor: pointer;

    // アイコンと疑似リップルエフェクトを中央寄せにする
    position: relative;

    &:hover {
      // lch(90.0%, 0.0, 0.0)相当
      background: #e2e2e2;
    }

    // 疑似リップルエフェクトの終了状態
    &::after {
      content: '';

      // 中央寄せ
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.5s, width 0.5s, height 0.5s;

      border-radius: 50%;

      // lch(50.0%, 0.0, 0.0)相当
      background: #777777;

      pointer-events: none;
    }

    // 疑似リップルエフェクトの開始状態
    &:active::after {
      width: 0;
      height: 0;
      opacity: 0.5;
      transition: opacity 0s, width 0s, height 0s;
    }
  }
</style>
