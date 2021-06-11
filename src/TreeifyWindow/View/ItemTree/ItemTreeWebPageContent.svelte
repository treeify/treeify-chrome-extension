<script context="module" lang="ts">
  import {List} from 'immutable'
  import {get, Readable} from 'svelte/store'
  import {doWithErrorCapture} from '../../errorCapture'
  import {External} from '../../External/External'
  import {CurrentState} from '../../Internal/CurrentState'
  import {Derived} from '../../Internal/Derived'
  import {InputId} from '../../Internal/InputId'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import {NullaryCommand} from '../../Internal/NullaryCommand'
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './ItemTreeContentView'

  export function createItemTreeWebPageContentProps(itemPath: ItemPath) {
    const itemId = ItemPath.getItemId(itemPath)
    const webPageItem = Internal.instance.state.webPageItems[itemId]
    const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
    const tab =
      tabId !== undefined ? External.instance.tabItemCorrespondence.getTab(tabId) : undefined
    const isUnloaded = External.instance.tabItemCorrespondence.isUnloaded(itemId)

    return {
      itemPath,
      labels: Derived.getLabels(itemPath),
      title: CurrentState.deriveWebPageItemTitle(itemId),
      faviconUrl: get(webPageItem.faviconUrl),
      isLoading: tab?.status === 'loading',
      isSoftUnloaded: tab?.discarded === true,
      isHardUnloaded: tab === undefined,
      isUnread: get(webPageItem.isUnread),
      isAudible: tab?.audible === true,
      onFocus: (event: FocusEvent) => {
        doWithErrorCapture(() => {
          // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
          if (event.target instanceof Node) {
            getSelection()?.setPosition(event.target)
          }
        })
      },
      onClickTitle: (event: MouseEvent) => {
        doWithErrorCapture(() => {
          switch (InputId.fromMouseEvent(event)) {
            case '0000MouseButton0':
              CurrentState.setTargetItemPath(itemPath)
              NullaryCommand.browseTabInDualWindowMode()
              CurrentState.commit()
              break
            case '1000MouseButton0':
              CurrentState.setTargetItemPath(itemPath)
              CurrentState.commit()
              break
            case '0010MouseButton0':
              CurrentState.setTargetItemPath(itemPath)
              NullaryCommand.browseTab()
              CurrentState.commit()
              break
          }
        })
      },
      onClickFavicon: (event: MouseEvent) => {
        doWithErrorCapture(() => {
          CurrentState.setTargetItemPath(itemPath)

          switch (InputId.fromMouseEvent(event)) {
            case '0000MouseButton0':
              event.preventDefault()

              if (tab === undefined) {
                // ハードアンロード状態の場合
                NullaryCommand.loadSubtree()
              } else {
                // ソフトアンロード状態またはロード状態の場合
                NullaryCommand.hardUnloadSubtree()
              }

              CurrentState.commit()
              break
            case '1000MouseButton0':
              event.preventDefault()

              if (tab === undefined) {
                // ハードアンロード状態の場合
                NullaryCommand.loadItem()
              } else {
                // ソフトアンロード状態またはロード状態の場合
                NullaryCommand.hardUnloadItem()
              }

              CurrentState.commit()
              break
            case '0100MouseButton0':
              event.preventDefault()

              if (isUnloaded) {
                // アンロード状態の場合
                NullaryCommand.loadSubtree()
              } else {
                // ロード状態の場合
                NullaryCommand.softUnloadSubtree()
              }

              CurrentState.commit()
              break
            case '1100MouseButton0':
              event.preventDefault()

              if (isUnloaded) {
                // アンロード状態の場合
                NullaryCommand.loadItem()
              } else {
                // ロード状態の場合
                NullaryCommand.softUnloadItem()
              }

              CurrentState.commit()
              break
          }
        })
      },
      onDragStart: (event: DragEvent) => {
        doWithErrorCapture(() => {
          if (event.dataTransfer === null) return

          const domElementId = ItemTreeContentView.focusableDomElementId(itemPath)
          const domElement = document.getElementById(domElementId)
          if (domElement === null) return
          // ドラッグ中にマウスポインターに追随して表示される内容を設定
          event.dataTransfer.setDragImage(domElement, 0, domElement.offsetHeight / 2)

          event.dataTransfer.setData('application/treeify', JSON.stringify(itemPath))
        })
      },
    }
  }
</script>

<script lang="ts">
  import {Readable} from 'svelte/store'

  export let itemPath: ItemPath
  export let labels: Readable<List<string>> | undefined
  export let title: Readable<string>
  export let faviconUrl: string
  export let isLoading: boolean
  export let isSoftUnloaded: boolean
  export let isHardUnloaded: boolean
  export let isUnread: boolean
  export let isAudible: boolean
  export let onFocus: (event: FocusEvent) => void
  export let onClickTitle: (event: MouseEvent) => void
  export let onClickFavicon: (event: MouseEvent) => void
  export let onDragStart: (event: DragEvent) => void

  const id = ItemTreeContentView.focusableDomElementId(itemPath)
</script>

<div class="item-tree-web-page-content" {id} tabindex="0" on:focus={onFocus}>
  {#if isLoading}
    <div class="item-tree-web-page-content_favicon loading-indicator" on:click={onClickFavicon} />
  {:else if faviconUrl.length > 0}
    <img
      class="item-tree-web-page-content_favicon"
      class:soft-unloaded-item={isSoftUnloaded}
      class:hard-unloaded-item={isHardUnloaded}
      src={faviconUrl}
      on:click={onClickFavicon}
    />
  {:else}
    <div
      class="item-tree-web-page-content_favicon default-favicon"
      class:soft-unloaded-item={isSoftUnloaded}
      class:hard-unloaded-item={isHardUnloaded}
      on:click={onClickFavicon}
    />
  {/if}

  {#if labels !== undefined && !$labels.isEmpty()}
    <div class="item-tree-web-page-content_labels">
      {#each $labels.toArray() as label}
        <Label text={label} />
      {/each}
    </div>
  {:else}
    <div class="grid-empty-cell" />
  {/if}
  <div
    class="item-tree-web-page-content_title"
    class:soft-unloaded-item={isSoftUnloaded}
    class:hard-unloaded-item={isHardUnloaded}
    class:unread={isUnread}
    title={$title}
    draggable="true"
    on:click={onClickTitle}
    on:dragstart={onDragStart}
  >
    {$title}
  </div>
  {#if isAudible}
    <div class="item-tree-web-page-content_audible-icon" />
  {:else}
    <div class="grid-empty-cell" />
  {/if}
</div>

<style>
  :root {
    /* ウェブページアイテムのファビコン領域（正方形）の一辺の長さ */
    --item-tree-favicon-size: 1em;

    /* 未読ウェブページアイテムのタイトルの色 */
    --item-tree-unread-web-page-item-title-color: hsl(240, 50%, 45%);

    /* ウェブページアイテムの音がなっていることを示すアイコン領域（正方形）の一辺の長さ */
    --item-tree-audible-icon-size: 1em;
    /* ウェブページアイテムの音がなっていることを示すアイコンの色 */
    --item-tree-audible-icon-color: hsl(0, 0%, 35%);

    /* アンロード済みウェブページアイテムのopacity */
    --soft-unloaded-web-page-item-opacity: 75%;
    --hard-unloaded-web-page-item-opacity: 55%;
  }

  /* ウェブページアイテムのコンテンツ領域のルート */
  .item-tree-web-page-content {
    /* ファビコン、ラベル、タイトル、audibleアイコンを横並びにする */
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    align-items: center;

    /* フォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  /* グレーアウト状態のウェブページアイテムのタイトル */
  :global(.grayed-out) .item-tree-web-page-content_title,
  :global(.grayed-out-children) .item-tree-web-page-content_title {
    color: var(--grayed-out-item-text-color);
  }

  /* ウェブページアイテムのファビコン */
  .item-tree-web-page-content_favicon {
    width: var(--item-tree-favicon-size);
    height: var(--item-tree-favicon-size);

    /* クリックして操作できることを示す */
    cursor: pointer;
  }
  /* デフォルトファビコン */
  .item-tree-web-page-content_favicon.default-favicon {
    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: hsl(0, 0%, 40%);
    -webkit-mask-image: url('./default-favicon.svg');
  }

  /* ローディングインジケータ */
  .loading-indicator {
    border-radius: 50%;
    border-top: 4px solid hsl(200, 0%, 30%);
    border-right: 4px solid hsl(200, 0%, 70%);
    border-bottom: 4px solid hsl(200, 0%, 70%);
    border-left: 4px solid hsl(200, 0%, 70%);
    box-sizing: border-box;
    animation: rotation 0.8s infinite linear;
  }
  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* ウェブページアイテムの音がなっていることを示すアイコン */
  .item-tree-web-page-content_audible-icon {
    width: var(--item-tree-audible-icon-size);
    height: var(--item-tree-audible-icon-size);

    background: var(--item-tree-audible-icon-color);
    -webkit-mask: url('./audible-icon.svg');
    -webkit-mask-size: contain;
  }

  /* ウェブページアイテムのタイトル */
  .item-tree-web-page-content_title {
    cursor: default;

    /*
        ウェブページアイテムのタイトルの折り返しを防ぐための設定。

        【折り返しを防ぐ理由】
        (1) ウェブページのタイトルは非常に長い場合もあり、Treeifyウィンドウの横幅が狭い場合は何行も専有して邪魔。
        (2) Chromeはタブ読込中に一瞬だけURLをタイトル扱いする場合がある。
            一般にURLは長い文字列なのでその瞬間だけ折り返しが発生し、画面がガクッと動くような印象を与えてしまう。
        */
    overflow-x: hidden;
    white-space: nowrap;
  }

  /* 未読ウェブページアイテムのタイトルの強調表示 */
  .item-tree-web-page-content_title.unread {
    color: var(--item-tree-unread-web-page-item-title-color);
  }

  /* アンロード済みウェブページアイテムのタイトルのグレーアウト */
  .item-tree-web-page-content_title.soft-unloaded-item {
    filter: opacity(var(--soft-unloaded-web-page-item-opacity));
  }
  .item-tree-web-page-content_title.hard-unloaded-item {
    filter: opacity(var(--hard-unloaded-web-page-item-opacity));
  }

  /* アンロード済みウェブページアイテムのファビコンのグレーアウト */
  .item-tree-web-page-content_favicon.soft-unloaded-item {
    filter: opacity(var(--soft-unloaded-web-page-item-opacity));
  }
  .item-tree-web-page-content_favicon.hard-unloaded-item {
    filter: opacity(var(--hard-unloaded-web-page-item-opacity));
  }
</style>
