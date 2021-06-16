<script lang="ts">
  import {doAsyncWithErrorCapture} from '../errorCapture'
  import {NullaryCommand} from '../Internal/NullaryCommand'
  import {Rerenderer} from '../Rerenderer'
  import {DataFolderPickerOpenButtonProps} from './DataFolderPickerOpenButtonProps'

  export let props: DataFolderPickerOpenButtonProps

  function onClick() {
    doAsyncWithErrorCapture(async () => {
      await NullaryCommand.saveToDataFolder()
      Rerenderer.instance.rerender()
    })
  }
</script>

<div class="toolbar-icon-button" on:click={onClick}>
  <div class="data-folder-picker-open-button_icon" class:grayed-out={props.isGrayedOut} />
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
