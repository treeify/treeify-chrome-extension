<script lang="ts">
  import { List } from 'immutable'
  import { doAsyncWithErrorCapture } from 'src/TreeifyTab/errorCapture'
  import { External } from 'src/TreeifyTab/External/External'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { DataFolderButtonProps } from 'src/TreeifyTab/View/Toolbar/DataFolderButtonProps'
  import ToolbarIconButton from 'src/TreeifyTab/View/Toolbar/ToolbarIconButton.svelte'
  import { assert } from 'src/Utility/Debug/assert'

  export let props: DataFolderButtonProps

  function onClick() {
    doAsyncWithErrorCapture(async () => {
      assert(List(External.instance.urlToItemIdsForTabCreation.values()).flatten().isEmpty())
      assert(External.instance.tabIdsToBeClosedForUnloading.size === 0)

      await Command.syncWithDataFolder()
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton
  title={props.isAlreadyOpen ? 'データフォルダと同期する' : 'データフォルダを開く'}
  on:click={onClick}
>
  <div
    class="data-folder-button_icon"
    class:already-open={props.isAlreadyOpen}
    class:completed={props.isCompleted}
  />
</ToolbarIconButton>

<style global lang="scss">
  :root {
    // データフォルダを開くボタンのアイコンの色。lch(45.0%, 0.0, 0.0)相当
    --data-folder-button-icon-color: #6a6a6a;
    // データフォルダを開くボタンのアイコンの完了状態の色。lch(70.0%, 0.0, 0.0)相当
    --data-folder-button-icon-completed-color: #ababab;
  }

  // データフォルダアイコン
  .data-folder-button_icon {
    width: 24px;
    aspect-ratio: 1;

    // 中央寄せ
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    background: var(--data-folder-button-icon-color);
    -webkit-mask: url('folder-open.svg') no-repeat center;
    -webkit-mask-size: contain;

    // 完了状態のデータフォルダアイコン
    &.completed {
      background: var(--data-folder-button-icon-completed-color);
    }

    &.already-open {
      -webkit-mask: url('folder-sync.svg');
    }
  }
</style>
