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
    class:grayed-out={props.isGrayedOut}
  />
</ToolbarIconButton>

<style global>
  :root {
    /* データフォルダを開くボタンのアイコンの色。lch(40.0%, 0.0, 0.0)相当 */
    --data-folder-button-icon-color: #777777;
    /* データフォルダを開くボタンのアイコンのグレーアウト状態の色。lch(70.0%, 0.0, 0.0)相当 */
    --data-folder-button-icon-grayed-out-color: #ababab;
  }

  /* データフォルダアイコン */
  .data-folder-button_icon {
    --icon-size: 24px;
    width: var(--icon-size);
    height: var(--icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    background: var(--data-folder-button-icon-color);
    -webkit-mask: url('folder-open.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
  /* グレーアウト状態のデータフォルダアイコン */
  .data-folder-button_icon.grayed-out {
    background: var(--data-folder-button-icon-grayed-out-color);
  }
  .data-folder-button_icon.already-open {
    -webkit-mask: url('folder-sync.svg');
  }
</style>
