import {html} from 'lit-html'
import {doAsyncWithErrorHandling} from 'src/Common/Debug/report'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import {css} from 'src/TreeifyWindow/View/css'

export function FullWindowModeButtonView() {
  return html`
    <div class="toolbar-icon-button" @click=${onClick}>
      <div class="full-window-mode-button_icon"></div>
    </div>
  `
}

function onClick() {
  doAsyncWithErrorHandling(async () => {
    await TreeifyWindow.toFullWindowMode()
  })
}

export const FullWindowModeButtonCss = css`
  :root {
    /* フルウィンドウモードボタンのアイコンのサイズ（正方形の一辺の長さ） */
    --full-window-mode-button-icon-size: 20px;
    /* フルウィンドウモードボタンのアイコンの色 */
    --full-window-mode-button-icon-color: hsl(0, 0%, 40%);
  }

  /* フルウィンドウモードボタンのアイコン */
  .full-window-mode-button_icon {
    width: var(--full-window-mode-button-icon-size);
    height: var(--full-window-mode-button-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* アイコンを単なるマスク画像として扱い、任意の色で塗るテクニック */
    background: var(--full-window-mode-button-icon-color);
    -webkit-mask: url('full-window.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
`
