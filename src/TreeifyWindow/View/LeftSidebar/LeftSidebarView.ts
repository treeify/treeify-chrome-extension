import {html} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {External} from 'src/TreeifyWindow/External/External'
import {State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
import {
  createPageTreeViewModel,
  PageTreeView,
  PageTreeViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeView'

export type LeftSidebarViewModel = {
  pageTreeViewModel: PageTreeViewModel
  isFloating: boolean
}

/**
 * 左サイドバーのViewModelを作る。
 * 左サイドバーを非表示にする場合はundefinedを返す。
 */
export function createLeftSidebarViewModel(state: State): LeftSidebarViewModel | undefined {
  // Treeifyウィンドウの横幅が画面横幅の50%以上のときは左サイドバーを表示する。
  // window.outerWidthを使うとウィンドウ最大化および最大化解除時に実態と異なる値になる（Macで確認済み）。
  // TODO: スレッショルドを50%固定ではなく変更可能にする
  if (window.innerWidth >= screen.width * 0.5) {
    return {
      pageTreeViewModel: createPageTreeViewModel(state),
      isFloating: false,
    }
  } else if (External.instance.shouldFloatingLeftSidebarShown) {
    return {
      pageTreeViewModel: createPageTreeViewModel(state),
      isFloating: true,
    }
  }

  return undefined
}

export function LeftSidebarView(viewModel: LeftSidebarViewModel) {
  return html`<aside
    class=${classMap({
      'left-sidebar': true,
      floating: viewModel.isFloating,
    })}
  >
    ${PageTreeView(viewModel.pageTreeViewModel)}
  </aside>`
}

export const LeftSidebarViewCss = css`
  :root {
    /* 左サイドバーの背景色 */
    --left-sidebar-background-color: hsl(0, 0%, 98%);

    /* 左サイドバーの幅 */
    --left-sidebar-width: 200px;

    /* ページツリーの項目のマウスホバー時の背景色 */
    --page-tree-hover-item-background-color: hsl(0, 0%, 95%);

    /* ページツリーのアクティブページの背景色 */
    --page-tree-active-page-background-color: hsl(0, 0%, 90%);

    /* 閉じるボタンのサイズ（正方形の一辺の長さ） */
    --page-tree-close-button-size: 1.1em;

    /* ウェブページアイテムのファビコン領域（正方形）の一辺の長さ */
    --page-tree-favicon-size: 1em;
  }

  .left-sidebar {
    flex-basis: var(--left-sidebar-width);
    flex-shrink: 0;

    /* サイドバーやアイテムツリーは独立してスクロール可能とする */
    overflow: auto;

    background: var(--left-sidebar-background-color);
    /* Dynalistを参考にしながら調整した影 */
    box-shadow: 1.5px 0 3px hsl(0, 0%, 85%);
  }

  /* フローティング型の左サイドバー */
  .left-sidebar.floating {
    position: fixed;
    height: 100%;
    width: var(--left-sidebar-width);
    /* TODO: この安易なz-index指定は必ずやトラブルの原因になるであろう */
    z-index: 1;
  }

  .page-tree-node {
    /* バレット&インデント領域とボディ&子リスト領域を横に並べる */
    display: flex;
  }

  .page-tree-node_body-and-children-area {
    /* コンテンツ領域を右端まで伸ばす */
    flex-grow: 1;
  }

  /* ページツリーの各ノードのコンテンツ領域と右端のボタン類を並べた領域 */
  .page-tree-node_body-area {
    display: flex;
    align-items: center;
  }
  .page-tree-node_body-area.active-page {
    /* アクティブページの強調表示 */
    background: var(--page-tree-active-page-background-color);
  }

  .page-tree-node_body-area:hover {
    background: var(--page-tree-hover-item-background-color);
  }

  .page-tree-node_content-area {
    flex-grow: 1;

    cursor: default;

    /* ページツリーではテキストは折り返さない */
    overflow-x: hidden;
    white-space: nowrap;
  }

  .page-tree-node_close-button {
    flex-basis: var(--page-tree-close-button-size);
    height: var(--page-tree-close-button-size);

    /* 横幅が縮まないよう設定 */
    flex-shrink: 0;

    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: hsl(0, 0%, 20%);
    -webkit-mask-image: url('close-icon2.svg');

    /* マウスホバー時にのみ表示 */
    display: none;

    /* ボタンであることを示す */
    cursor: pointer;
  }
  .page-tree-node_body-area:hover .page-tree-node_close-button {
    /* マウスホバー時にのみ表示 */
    display: initial;
  }

  .page-tree-web-page-content {
    /* ファビコンとタイトルを横に並べる */
    display: flex;
    align-items: center;
  }

  .page-tree-web-page-content_favicon {
    width: var(--page-tree-favicon-size);
    height: var(--page-tree-favicon-size);
  }
`
