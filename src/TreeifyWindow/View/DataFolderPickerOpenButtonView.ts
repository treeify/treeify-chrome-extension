import {html} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {doWithErrorHandling} from 'src/Common/Debug/report'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {css} from 'src/TreeifyWindow/View/css'

export type DataFolderPickerOpenButtonViewModel = {
  isGrayedOut: boolean
}

export function createDataFolderPickerOpenButtonViewModel(): DataFolderPickerOpenButtonViewModel {
  return {
    isGrayedOut:
      External.instance.dataFolder !== undefined &&
      External.instance.pendingMutatedPropertyPaths.size === 0,
  }
}

export function DataFolderPickerOpenButtonView(viewModel: DataFolderPickerOpenButtonViewModel) {
  return html`
    <div class="toolbar-icon-button" @click=${onClick}>
      <div
        class=${classMap({
          'data-folder-picker-open-button_icon': true,
          'grayed-out': viewModel.isGrayedOut,
        })}
      ></div>
    </div>
  `
}

function onClick() {
  doWithErrorHandling(() => {
    NullaryCommand.saveToDataFolder()
    CurrentState.commit()
  })
}

export const DataFolderPickerOpenButtonCss = css`
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
`
