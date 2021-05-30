import {classMap, createDivElement} from 'src/TreeifyWindow/View/createElement'
import {css} from 'src/TreeifyWindow/View/css'

export type PageTreeBulletAndIndentViewModel = {
  bulletState: PageTreeBulletState
}

enum PageTreeBulletState {
  NO_CHILDREN,
  EXPANDED,
  COLLAPSED,
}

export function createPageTreeBulletAndIndentViewModel(
  hasChildren: boolean
): PageTreeBulletAndIndentViewModel {
  if (hasChildren) {
    return {
      bulletState: PageTreeBulletState.EXPANDED,
    }
  } else {
    return {
      bulletState: PageTreeBulletState.NO_CHILDREN,
    }
  }
}

/** ページツリーのバレットとインデント */
export function PageTreeBulletAndIndentView(viewModel: PageTreeBulletAndIndentViewModel) {
  return createDivElement('page-tree-bullet-and-indent', {}, [
    viewModel.bulletState === PageTreeBulletState.EXPANDED
      ? createDivElement('page-tree-bullet-and-indent_indent-area', {}, [
          createDivElement('page-tree-bullet-and-indent_indent-line'),
        ])
      : undefined,
    createDivElement(
      classMap({
        'page-tree-bullet-and-indent_bullet-area': true,
        'no-children': viewModel.bulletState === PageTreeBulletState.NO_CHILDREN,
        expanded: viewModel.bulletState === PageTreeBulletState.EXPANDED,
        collapsed: viewModel.bulletState === PageTreeBulletState.COLLAPSED,
      })
    ),
  ])
}

export const PageTreeBulletAndIndentCss = css`
  :root {
    /* インデントラインの太さ */
    --page-tree-indent-line-width: 1px;
    /* インデントラインの色 */
    --page-tree-indent-line-color: hsl(0, 0%, 80%);
    /* インデントラインの色（ホバー時） */
    --page-tree-indent-line-hover-color: hsl(0, 0%, 70%);

    /* バレットのサイズ（正方形の一辺の長さ） */
    --page-tree-bullet-size: 0.7em;
  }

  .page-tree-bullet-and-indent {
    /* インデント領域の位置指定のため */
    position: relative;

    /*
    バレットが収まるギリギリまで幅を狭くする（アイテムツリーとの違いに注意）。
    ページツリーは横幅がシビアなのでインデント領域の幅を切り詰めないと厳しい。
    */
    width: var(--page-tree-bullet-size);
    height: 100%;
  }

  /* インデント領域 */
  .page-tree-bullet-and-indent_indent-area {
    position: absolute;
    /* バレットの中心のY座標から子リストの下端までの領域にする */
    top: calc(var(--page-tree-calculated-line-height) / 2);
    height: calc(100% - var(--page-tree-calculated-line-height) / 2);
    width: 100%;
  }

  /* インデントライン */
  .page-tree-bullet-and-indent_indent-line {
    background: var(--page-tree-indent-line-color);
    width: var(--page-tree-indent-line-width);
    height: 100%;
    margin: 0 auto;
  }
  /* ホバー時のインデントライン */
  .page-tree-bullet-and-indent:hover .page-tree-bullet-and-indent_indent-line {
    background: var(--page-tree-indent-line-hover-color);
  }

  /* バレットの共通設定 */
  .page-tree-bullet-and-indent_bullet-area {
    position: absolute;
    top: calc(var(--page-tree-calculated-line-height) / 2);
    left: 50%;
    transform: translate(-50%, -50%);

    width: var(--page-tree-bullet-size);
    height: var(--page-tree-bullet-size);
  }

  /* 展開済み状態のバレット */
  .page-tree-bullet-and-indent_bullet-area.expanded {
    /* TODO: 画像待ち */
    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    /*background-color: hsl(0, 0%, 60%);*/
    /*-webkit-mask-image: url('menu-down.svg');*/
  }
`
