import {html} from 'lit-html'
import {styleMap} from 'lit-html/directives/style-map'
import {doWithErrorHandling} from 'src/Common/Debug/report'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State, WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'

export type WebPageItemTitleSettingDialogViewModel = {
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialog
  /** タイトル入力欄のテキストの初期値 */
  initialTitle: string
  onKeyDown: (event: KeyboardEvent) => void
}

export function createWebPageItemTitleSettingDialogViewModel(
  state: State
): WebPageItemTitleSettingDialogViewModel | undefined {
  if (state.webPageItemTitleSettingDialog === null) return undefined

  const targetItemPath = state.pages[state.activePageId].targetItemPath
  const targetItemId = ItemPath.getItemId(targetItemPath)

  return {
    webPageItemTitleSettingDialog: state.webPageItemTitleSettingDialog,
    initialTitle: CurrentState.deriveWebPageItemTitle(targetItemId),
    onKeyDown: (event) => {
      doWithErrorHandling(() => {
        if (event.isComposing) return

        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          if (event.target.value === '') {
            // 入力欄が空の状態でEnterキーを押したらタイトル設定を削除する
            CurrentState.setWebPageItemTitle(targetItemId, null)
          } else {
            CurrentState.setWebPageItemTitle(targetItemId, event.target.value)
          }
          // タイトル設定ダイアログを閉じる
          CurrentState.setWebPageItemTitleSettingDialog(null)

          // フォーカスを戻す
          const domElementId = ItemTreeContentView.focusableDomElementId(targetItemPath)
          External.instance.requestFocusAfterRendering(domElementId)

          CurrentState.commit()
        }
      })
    },
  }
}

export function WebPageItemTitleSettingDialogView(
  viewModel: WebPageItemTitleSettingDialogViewModel
) {
  const style = styleMap({
    left: `${viewModel.webPageItemTitleSettingDialog.targetItemRect.left}px`,
    top: `${viewModel.webPageItemTitleSettingDialog.targetItemRect.top}px`,
    width: `${viewModel.webPageItemTitleSettingDialog.targetItemRect.width}px`,
    height: `${viewModel.webPageItemTitleSettingDialog.targetItemRect.height}px`,
  })
  return html`
    <div class="web-page-item-title-setting-dialog" style=${style}>
      <input
        type="text"
        class="web-page-item-title-setting-dialog_text-box"
        value=${viewModel.initialTitle}
        @keydown=${viewModel.onKeyDown}
      />
    </div>
  `
}

export const WebPageItemTitleSettingDialogCss = css`
  /* ウェブページアイテムのタイトル設定ダイアログ */
  .web-page-item-title-setting-dialog {
    /*
    ウェブページアイテムの位置に合わせたフローティング。
    left, top, width, heightがJavaScriptで設定される。
    */
    position: absolute;
  }

  /* ウェブページアイテムのタイトル設定ダイアログのテキスト入力欄 */
  .web-page-item-title-setting-dialog_text-box {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
  }
`
