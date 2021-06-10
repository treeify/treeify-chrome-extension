<script context="module" lang="ts">
  import {External} from '../../External/External'
  import {Internal} from '../../Internal/Internal'
  import {createPageTreeViewModel, PageTreeViewModel} from './PageTreeView'

  /**
   * 左サイドバーのViewModelを作る。
   * 左サイドバーを非表示にする場合はundefinedを返す。
   */
  export function createLeftSidebarProps() {
    // Treeifyウィンドウの横幅が画面横幅の50%以上のときは左サイドバーを表示する。
    // window.outerWidthを使うとウィンドウ最大化および最大化解除時に実態と異なる値になる（Macで確認済み）。
    // TODO: スレッショルドを50%固定ではなく変更可能にする
    if (window.innerWidth >= screen.width * 0.5) {
      return {
        pageTreeViewModel: createPageTreeViewModel(Internal.instance.state),
        isFloating: false,
      }
    } else if (External.instance.shouldFloatingLeftSidebarShown) {
      return {
        pageTreeViewModel: createPageTreeViewModel(Internal.instance.state),
        isFloating: true,
      }
    }

    return undefined
  }
</script>

<script lang="ts">
  import PageTree from './PageTree.svelte'

  export let pageTreeViewModel: PageTreeViewModel
  export let isFloating: boolean
</script>

<aside class="left-sidebar" class:floating={isFloating}>
  <PageTree {...pageTreeViewModel} />
</aside>

<style>
  :root {
    /* 左サイドバーの背景色 */
    --left-sidebar-background-color: hsl(0, 0%, 98%);

    /* 左サイドバーの幅 */
    --left-sidebar-width: 200px;
  }

  .left-sidebar {
    width: var(--left-sidebar-width);
    height: 100%;

    overflow-y: auto;

    background: var(--left-sidebar-background-color);
    /* Dynalistを参考にしながら調整した影 */
    box-shadow: 1.5px 0 3px hsl(0, 0%, 85%);
  }

  /* フローティング型の左サイドバー */
  .left-sidebar.floating {
    position: fixed;
    /* TODO: この安易なz-index指定は必ずやトラブルの原因になるであろう */
    z-index: 1;
  }
</style>
