import {html, TemplateResult} from 'lit-html'
import {styleMap} from 'lit-html/directives/style-map'
import {integer} from 'src/Common/integer'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'

export type ItemTreeSpoolViewModel = {
  bulletState: ItemTreeBulletState
  /**
   * expand時に表示されるアイテム数。
   * collapsed状態以外の場合は常に0。
   */
  hiddenItemsCount: integer
  onClick: (event: MouseEvent) => void
}

export enum ItemTreeBulletState {
  NO_CHILDREN,
  EXPANDED,
  COLLAPSED,
  PAGE,
}

export function createItemTreeSpoolViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeSpoolViewModel {
  const bulletState = deriveBulletState(state, itemPath)

  const onClick = (event: MouseEvent) => {
    doWithErrorCapture(() => {
      CurrentState.setTargetItemPath(itemPath)

      const inputId = InputId.fromMouseEvent(event)
      switch (bulletState) {
        case ItemTreeBulletState.NO_CHILDREN:
          switch (inputId) {
            case '1000MouseButton0':
              NullaryCommand.turnIntoAndShowPage()
              break
          }
          break
        case ItemTreeBulletState.EXPANDED:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.toggleCollapsed()
              break
            case '1000MouseButton0':
              NullaryCommand.turnIntoAndShowPage()
              break
          }
          break
        case ItemTreeBulletState.COLLAPSED:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.toggleCollapsed()
              break
            case '1000MouseButton0':
              NullaryCommand.turnIntoAndShowPage()
              break
          }
          break
        case ItemTreeBulletState.PAGE:
          switch (inputId) {
            case '0000MouseButton0':
              NullaryCommand.showPage()
              break
            case '1000MouseButton0':
              NullaryCommand.turnIntoNonPageAndExpand()
              CurrentState.commit()
          }
          break
      }
      CurrentState.commit()
    })
  }

  return {bulletState, hiddenItemsCount: countHiddenItems(state, itemPath), onClick}
}

function countHiddenItems(state: State, itemPath: ItemPath): integer {
  const bulletState = deriveBulletState(state, itemPath)
  if (bulletState !== ItemTreeBulletState.COLLAPSED) return 0

  const counts = state.items[ItemPath.getItemId(itemPath)].childItemIds.map((childItemId) => {
    return CurrentState.getDisplayingChildItemIds(itemPath.push(childItemId)).size
  })
  return counts.size + counts.reduce((a: integer, x) => a + x, 0)
}

export function deriveBulletState(state: State, itemPath: ItemPath): ItemTreeBulletState {
  const itemId = ItemPath.getItemId(itemPath)
  if (state.pages[itemId] !== undefined) {
    return ItemTreeBulletState.PAGE
  } else if (state.items[itemId].childItemIds.size === 0) {
    return ItemTreeBulletState.NO_CHILDREN
  } else {
    CurrentState.getIsCollapsed(itemPath)
    return CurrentState.getIsCollapsed(itemPath)
      ? ItemTreeBulletState.COLLAPSED
      : ItemTreeBulletState.EXPANDED
  }
}

/** アイテムツリーのバレットとインデント */
export function ItemTreeSpoolView(viewModel: ItemTreeSpoolViewModel): TemplateResult {
  // TODO: ↓ハードコーディングが激しい。できればユーザーがバレットのサイズを設定できるようにしたい
  const limitedHiddenItemsCount = Math.min(viewModel.hiddenItemsCount, 10)
  const outerCircleRadiusEm = 1.1 + limitedHiddenItemsCount * 0.025
  const outerCircleStyle = styleMap({
    width: `${outerCircleRadiusEm}em`,
    height: `${outerCircleRadiusEm}em`,
  })

  return html`<div class="item-tree-spool" @click=${viewModel.onClick}>
    ${viewModel.bulletState === ItemTreeBulletState.EXPANDED
      ? html`<div class="item-tree-spool_indent-area">
          <div class="item-tree-spool_indent-line"></div>
        </div>`
      : undefined}
    <div class="item-tree-spool_bullet-area">
      ${viewModel.bulletState === ItemTreeBulletState.PAGE
        ? html`<div class="item-tree-spool_page-icon" />`
        : html`
            ${viewModel.bulletState === ItemTreeBulletState.COLLAPSED
              ? html`<div class="item-tree-spool_outer-circle" style=${outerCircleStyle}></div>`
              : undefined}
            <div class="item-tree-spool_inner-circle"></div>
          `}
    </div>
  </div>`
}

export const ItemTreeSpoolCss = css`
  :root {
    /* バレットの外側の円の直径は{@link ItemTreeSpoolView.ts}で動的に設定している */
    /* バレットの外側の円の色 */
    --item-tree-bullet-outer-circle-color: hsl(0, 0%, 80%);
    /* バレットの外側の円のマウスホバー時の色 */
    --item-tree-bullet-outer-circle-hover-color: hsl(0, 0%, 70%);
    /* バレットの内側の円の直径 */
    --item-tree-bullet-inner-circle-diameter: 0.45em;
    /* バレットの内側の円の色 */
    --item-tree-bullet-inner-circle-color: hsl(0, 0%, 35%);
    /* バレットの内側の円のマウスホバー時の色 */
    --item-tree-bullet-inner-circle-hover-color: hsl(0, 0%, 0%);
    /* バレットとして表示されるページアイコンのサイズ（正方形の一辺の長さ） */
    --bullet-page-icon-size: 1em;

    /* トランスクルードされたアイテムのバレットの色 */
    --transcluded-item-bullet-color: hsl(120, 50%, 35%);
    /* トランスクルードされたアイテムのバレットのマウスホバー時の色 */
    --transcluded-item-bullet-hover-color: hsl(120, 50%, 30%);

    /* ハイライト状態のアイテムのバレットの色 */
    --highlighted-item-bullet-color: hsl(0, 100%, 45%);
    /* ハイライト状態のアイテムのバレットのマウスホバー時の色 */
    --highlighted-item-bullet-hover-color: hsl(0, 100%, 40%);

    /* インデントラインの太さ */
    --item-tree-indent-line-width: 1px;
    /* インデントラインの色 */
    --item-tree-indent-line-color: hsl(0, 0%, 88%);
    /* インデントラインの色（ホバー時） */
    --item-tree-indent-line-hover-color: hsl(0, 0%, 70%);
  }

  /* トランスクルードされたアイテムの強調表示 */
  .transcluded .item-tree-spool_inner-circle {
    background: var(--transcluded-item-bullet-color);
  }
  .transcluded .item-tree-spool:hover .item-tree-spool_inner-circle {
    background: var(--transcluded-item-bullet-hover-color);
  }
  .transcluded .item-tree-spool_page-icon {
    background: var(--transcluded-item-bullet-color);
  }
  .transcluded .item-tree-spool:hover .item-tree-spool_page-icon {
    background: var(--transcluded-item-bullet-hover-color);
  }

  /* ハイライト状態のアイテムの強調表示 */
  .highlighted-item .item-tree-spool_inner-circle {
    background: var(--highlighted-item-bullet-color);
  }
  .highlighted-item .item-tree-spool:hover .item-tree-spool_inner-circle {
    background: var(--highlighted-item-bullet-hover-color);
  }
  .highlighted-item .item-tree-spool_page-icon {
    background: var(--highlighted-item-bullet-color);
  }
  .highlighted-item .item-tree-spool:hover .item-tree-spool_page-icon {
    background: var(--highlighted-item-bullet-hover-color);
  }

  /* アイテムツリーのバレットとインデントのルート要素 */
  .item-tree-spool {
    width: var(--item-tree-calculated-line-height);
    height: 100%;
    /* インデントラインをバレットの裏まで描画するための設定 */
    position: relative;

    cursor: pointer;
  }

  .item-tree-spool_bullet-area {
    width: var(--item-tree-calculated-line-height);
    height: var(--item-tree-calculated-line-height);
    /* 外側の円と内側の円を重ねて描画するための設定 */
    position: relative;
  }

  /* アイテムツリーのバレットの外側の円（展開状態用） */
  .item-tree-spool_outer-circle {
    /* widthとheightがJavaScriptで設定される */

    border-radius: 50%;
    background: var(--item-tree-bullet-outer-circle-color);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .item-tree-spool:hover .item-tree-spool_outer-circle {
    background: var(--item-tree-bullet-outer-circle-hover-color);
  }

  /* アイテムツリーのバレットの内側の円 */
  .item-tree-spool_inner-circle {
    width: var(--item-tree-bullet-inner-circle-diameter);
    height: var(--item-tree-bullet-inner-circle-diameter);
    border-radius: 50%;
    background: var(--item-tree-bullet-inner-circle-color);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .item-tree-spool:hover .item-tree-spool_inner-circle {
    background: var(--item-tree-bullet-inner-circle-hover-color);
  }

  /* ページのバレット */
  .item-tree-spool_page-icon {
    width: var(--bullet-page-icon-size);
    height: var(--bullet-page-icon-size);

    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: var(--item-tree-bullet-inner-circle-color);
    -webkit-mask-image: url('./page-icon.svg');

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .item-tree-spool:hover .item-tree-spool_page-icon {
    background: var(--item-tree-bullet-inner-circle-hover-color);
  }

  /* インデント領域 */
  .item-tree-spool_indent-area {
    position: absolute;
    /* バレットの中心のY座標から子リストの下端までの領域にする */
    top: calc(var(--item-tree-calculated-line-height) / 2);
    height: calc(100% - var(--item-tree-calculated-line-height) / 2);
    width: 100%;
  }

  /* インデントライン */
  .item-tree-spool_indent-line {
    background: var(--item-tree-indent-line-color);
    width: var(--item-tree-indent-line-width);
    height: 100%;
    margin: 0 auto;
  }

  /* バレットとインデントの領域のホバー時のインデントライン */
  .item-tree-spool:hover .item-tree-spool_indent-line {
    background: var(--item-tree-indent-line-hover-color);
  }
`
