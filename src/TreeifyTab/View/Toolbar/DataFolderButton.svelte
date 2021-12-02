<script lang="ts">
  import { List } from 'immutable'
  import { External } from 'src/TreeifyTab/External/External'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { DataFolderButtonProps } from 'src/TreeifyTab/View/Toolbar/DataFolderButtonProps'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'
  import { assert } from 'src/Utility/Debug/assert'
  import { doAsync } from 'src/Utility/doAsync'

  export let props: DataFolderButtonProps

  function onClick() {
    doAsync(async () => {
      assert(List(External.instance.urlToItemIdsForTabCreation.values()).flatten().isEmpty())
      assert(External.instance.tabIdsToBeClosedForUnloading.size === 0)

      await Command.syncWithDataFolder()
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton
  title={props.isAlreadyOpen ? '現在のデータをデータフォルダと同期する' : 'データフォルダを開く'}
  on:click={onClick}
>
  <div
    class="data-folder-button_icon"
    class:already-open={props.isAlreadyOpen}
    class:completed={props.isCompleted}
  />
</ToolbarIconButton>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    // データフォルダを開くボタンのアイコンの色。lch(45.0%, 0.0, 0.0)相当
    --data-folder-button-icon-color: #6a6a6a;
  }

  // データフォルダアイコン
  .data-folder-button_icon {
    @include common.square(24px);

    // 中央寄せ
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    background: var(--data-folder-button-icon-color);
    -webkit-mask: url('folder-open.svg') no-repeat center;
    -webkit-mask-size: contain;

    &.already-open {
      -webkit-mask: url('folder-sync.svg');
    }

    &.completed {
      -webkit-mask: url('folder-check.svg');
    }
  }
</style>
