<script lang="ts">
  import {List} from 'immutable'
  import {assert} from '../../../Common/Debug/assert'
  import {doAsyncWithErrorCapture} from '../../errorCapture'
  import {External} from '../../External/External'
  import {Command} from '../../Internal/Command'
  import {Rerenderer} from '../../Rerenderer'
  import {DataFolderButtonProps} from './DataFolderButtonProps'
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  export let props: DataFolderButtonProps

  function onClick() {
    doAsyncWithErrorCapture(async () => {
      assert(List(External.instance.urlToItemIdsForTabCreation.values()).flatten().isEmpty())
      assert(External.instance.hardUnloadedTabIds.size === 0)

      await Command.saveToDataFolder()
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton on:click={onClick}>
  <div
    class="data-folder-button_icon"
    class:already-open={props.isAlreadyOpen}
    class:finished={props.isFinished}
    title={props.isAlreadyOpen ? 'データフォルダと同期する' : 'データフォルダを開く'}
  />
</ToolbarIconButton>

<style global lang="scss">
  :root {
    // データフォルダを開くボタンのアイコンの色。lch(45.0%, 0.0, 0.0)相当
    --data-folder-button-icon-color: #6a6a6a;
    // データフォルダを開くボタンのアイコンの完了状態の色。lch(70.0%, 0.0, 0.0)相当
    --data-folder-button-icon-finished-color: #ababab;
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
    &.finished {
      background: var(--data-folder-button-icon-finished-color);
    }

    &.already-open {
      -webkit-mask: url('folder-sync.svg');
    }
  }
</style>
