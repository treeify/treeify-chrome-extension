<script context="module" lang="ts">
  import {get} from 'svelte/store'
  import {integer} from '../../../Common/integer'
  import {doWithErrorCapture} from '../../errorCapture'
  import {CurrentState} from '../../Internal/CurrentState'
  import {InputId} from '../../Internal/InputId'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import {NullaryCommand} from '../../Internal/NullaryCommand'
  import {State} from '../../Internal/State'

  export enum ItemTreeBulletState {
    NO_CHILDREN,
    EXPANDED,
    COLLAPSED,
    PAGE,
  }

  export function createItemTreeSpoolProps(itemPath: ItemPath) {
    const state = Internal.instance.state
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

    const counts = get(state.items[ItemPath.getItemId(itemPath)].childItemIds).map(
      (childItemId) => {
        return CurrentState.getDisplayingChildItemIds(itemPath.push(childItemId)).size
      }
    )
    return counts.size + counts.reduce((a: integer, x) => a + x, 0)
  }

  function deriveBulletState(state: State, itemPath: ItemPath): ItemTreeBulletState {
    const itemId = ItemPath.getItemId(itemPath)
    if (state.pages[itemId] !== undefined) {
      return ItemTreeBulletState.PAGE
    } else if (get(state.items[itemId].childItemIds).size === 0) {
      return ItemTreeBulletState.NO_CHILDREN
    } else {
      return CurrentState.getIsCollapsed(itemPath)
        ? ItemTreeBulletState.COLLAPSED
        : ItemTreeBulletState.EXPANDED
    }
  }
</script>

<script lang="ts">
  export let bulletState: ItemTreeBulletState
  /**
   * expand時に表示されるアイテム数。
   * collapsed状態以外の場合は常に0。
   */
  export let hiddenItemsCount: integer
  export let onClick: (event: MouseEvent) => void

  // TODO: ↓ハードコーディングが激しい。できればユーザーがバレットのサイズを設定できるようにしたい
  const limitedHiddenItemsCount = Math.min(hiddenItemsCount, 10)
  const outerCircleRadiusEm = 1.1 + limitedHiddenItemsCount * 0.025
  const outerCircleStyle = `
    width: ${outerCircleRadiusEm}em;
    height: ${outerCircleRadiusEm}em;
  `
</script>

<div class="item-tree-spool" on:click={onClick}>
  {#if bulletState === ItemTreeBulletState.EXPANDED}
    <div class="item-tree-spool_indent-area">
      <div class="item-tree-spool_indent-line" />
    </div>
  {/if}
  <div class="item-tree-spool_bullet-area">
    {#if bulletState === ItemTreeBulletState.PAGE}
      <div class="item-tree-spool_page-icon" />
    {:else}
      {#if bulletState === ItemTreeBulletState.COLLAPSED}
        <div class="item-tree-spool_outer-circle" style={outerCircleStyle} />
      {/if}
      <div class="item-tree-spool_inner-circle" />
    {/if}
  </div>
</div>

<style>
  :root {
    /* バレットの外側の円の直径は{@link ItemTreeSpool.svelte}で動的に設定している */
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
    --transcluded-item-bullet-color: hsl(120, 50%, 40%);
    /* トランスクルードされたアイテムのバレットのマウスホバー時の色 */
    --transcluded-item-bullet-hover-color: hsl(120, 50%, 35%);

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
  :global(.transcluded) .item-tree-spool_inner-circle {
    background: var(--transcluded-item-bullet-color);
  }
  :global(.transcluded) .item-tree-spool:hover .item-tree-spool_inner-circle {
    background: var(--transcluded-item-bullet-hover-color);
  }
  :global(.transcluded) .item-tree-spool_page-icon {
    background: var(--transcluded-item-bullet-color);
  }
  :global(.transcluded) .item-tree-spool:hover .item-tree-spool_page-icon {
    background: var(--transcluded-item-bullet-hover-color);
  }

  /* ハイライト状態のアイテムの強調表示 */
  :global(.highlighted) .item-tree-spool_inner-circle {
    background: var(--highlighted-item-bullet-color);
  }
  :global(.highlighted) .item-tree-spool:hover .item-tree-spool_inner-circle {
    background: var(--highlighted-item-bullet-hover-color);
  }
  :global(.highlighted) .item-tree-spool_page-icon {
    background: var(--highlighted-item-bullet-color);
  }
  :global(.highlighted) .item-tree-spool:hover .item-tree-spool_page-icon {
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
</style>
