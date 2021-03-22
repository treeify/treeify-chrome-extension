import {State, WebPageItemTitleSettingDialog} from 'src/TreeifyWindow/Internal/State'
import {styleMap} from 'lit-html/directives/style-map'
import {html} from 'lit-html'
import {NextState} from 'src/TreeifyWindow/Internal/NextState'
import {doWithErrorHandling} from 'src/Common/Debug/report'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {External} from 'src/TreeifyWindow/External/External'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'

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
    initialTitle:
      NextState.getWebPageItemTitle(targetItemId) ?? NextState.getWebPageItemTabTitle(targetItemId),
    onKeyDown: (event) => {
      doWithErrorHandling(() => {
        if (event.isComposing) return

        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          if (event.target.value === '') {
            // 入力欄が空の状態でEnterキーを押したらタイトル設定を削除する
            NextState.setWebPageItemTitle(targetItemId, null)
          } else {
            NextState.setWebPageItemTitle(targetItemId, event.target.value)
          }
          // タイトル設定ダイアログを閉じる
          NextState.setWebPageItemTitleSettingDialog(null)

          // フォーカスを戻す
          const domElementId = ItemTreeContentView.focusableDomElementId(targetItemPath)
          External.instance.requestFocusAfterRendering(domElementId)

          NextState.commit()
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
    <div id="web-page-item-title-setting-dialog" style=${style}>
      <input
        type="text"
        class="web-page-item-title-setting-dialog_text-box"
        value=${viewModel.initialTitle}
        @keydown=${viewModel.onKeyDown}
      />
    </div>
  `
}
