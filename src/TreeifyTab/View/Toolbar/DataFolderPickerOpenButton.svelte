<script lang="ts">
  import {List} from 'immutable'
  import {assert} from '../../../Common/Debug/assert'
  import {doAsyncWithErrorCapture} from '../../errorCapture'
  import {External} from '../../External/External'
  import {NullaryCommand} from '../../Internal/NullaryCommand'
  import {Rerenderer} from '../../Rerenderer'
  import {DataFolderPickerOpenButtonProps} from './DataFolderPickerOpenButtonProps'
  import ToolbarIconButton from './ToolbarIconButton.svelte'

  export let props: DataFolderPickerOpenButtonProps

  function onClick() {
    doAsyncWithErrorCapture(async () => {
      assert(List(External.instance.urlToItemIdsForTabCreation.values()).flatten().isEmpty())
      assert(External.instance.hardUnloadedTabIds.size === 0)

      await NullaryCommand.saveToDataFolder()
      Rerenderer.instance.rerender()
    })
  }
</script>

<ToolbarIconButton on:click={onClick}>
  <div class="data-folder-picker-open-button_icon" class:grayed-out={props.isGrayedOut} />
</ToolbarIconButton>

<style>
  :root {
    /* データフォルダを開くボタンのアイコンのサイズ（正方形の一辺の長さ） */
    --data-folder-picker-open-button-icon-size: 22px;
    /* データフォルダを開くボタンのアイコンの色。lch(40.0%, 0.0, 0.0)相当 */
    --data-folder-picker-open-button-icon-color: #5e5e5e;
    /* データフォルダを開くボタンのアイコンのグレーアウト状態の色。lch(70.0%, 0.0, 0.0)相当 */
    --data-folder-picker-open-button-icon-grayed-out-color: #ababab;
  }

  /* データフォルダアイコン */
  .data-folder-picker-open-button_icon {
    width: var(--data-folder-picker-open-button-icon-size);
    height: var(--data-folder-picker-open-button-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    background: var(--data-folder-picker-open-button-icon-color);
    -webkit-mask-image: url('folder-icon.svg');
  }
  /* グレーアウト状態のデータフォルダアイコン */
  .data-folder-picker-open-button_icon.grayed-out {
    background: var(--data-folder-picker-open-button-icon-grayed-out-color);
  }
</style>
