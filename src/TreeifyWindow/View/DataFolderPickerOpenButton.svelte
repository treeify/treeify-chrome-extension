<script context="module" lang="ts">
  import {External} from '../External/External'

  export function createDataFolderPickerOpenButtonProps() {
    return {
      isGrayedOut:
        External.instance.dataFolder !== undefined &&
        External.instance.pendingMutatedChunkIds.size === 0,
    }
  }
</script>

<script lang="ts">
  import {doAsyncWithErrorCapture} from '../errorCapture'
  import {CurrentState} from '../Internal/CurrentState'
  import {NullaryCommand} from '../Internal/NullaryCommand'

  export let isGrayedOut: boolean

  function onClick() {
    doAsyncWithErrorCapture(async () => {
      await NullaryCommand.saveToDataFolder()
      CurrentState.commit()
    })
  }
</script>

<div class="toolbar-icon-button" on:click={onClick}>
  <div class="data-folder-picker-open-button_icon" class:grayed-out={isGrayedOut} />
</div>

<style>
  :root {
    /* データフォルダを開くボタンのアイコンのサイズ（正方形の一辺の長さ） */
    --data-folder-picker-open-button-icon-size: 22px;
    /* データフォルダを開くボタンのアイコンの色 */
    --data-folder-picker-open-button-icon-color: hsl(0, 0%, 40%);
    /* データフォルダを開くボタンのアイコンのグレーアウト状態の色 */
    --data-folder-picker-open-button-icon-grayed-out-color: hsl(0, 0%, 70%);
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

    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: var(--data-folder-picker-open-button-icon-color);
    -webkit-mask-image: url('folder-icon.svg');
  }
  /* グレーアウト状態のデータフォルダアイコン */
  .data-folder-picker-open-button_icon.grayed-out {
    background: var(--data-folder-picker-open-button-icon-grayed-out-color);
  }
</style>
