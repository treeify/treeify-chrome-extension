import {html, TemplateResult} from 'lit-html'
import {TOP_ITEM_ID} from 'src/Common/basicType'
import {toOpmlString} from 'src/TreeifyWindow/Internal/importAndExport'
import {State} from 'src/TreeifyWindow/Internal/State'
import {DataFolderPickerOpenButtonView} from 'src/TreeifyWindow/View/DataFolderPickerOpenButtonView'
import {
  createWebPageItemTitleSettingDialogViewModel,
  WebPageItemTitleSettingDialogView,
  WebPageItemTitleSettingDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialog'
import {
  createItemTreeViewModel,
  ItemTreeView,
  ItemTreeViewModel,
} from 'src/TreeifyWindow/View/ItemTree/ItemTreeView'
import {
  createLeftSidebarViewModel,
  LeftSidebarView,
  LeftSidebarViewModel,
} from 'src/TreeifyWindow/View/LeftSidebar/LeftSidebarView'

export type RootViewModel = {
  leftSidebarViewModel: LeftSidebarViewModel | undefined
  itemTreeViewModel: ItemTreeViewModel
  webPageItemTitleSettingDialog: WebPageItemTitleSettingDialogViewModel | undefined
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    leftSidebarViewModel: createLeftSidebarViewModel(state),
    itemTreeViewModel: createItemTreeViewModel(state),
    webPageItemTitleSettingDialog: createWebPageItemTitleSettingDialogViewModel(state),
  }
}

/** html-litによる動的描画が行われる領域全体のルートView */
export function RootView(viewModel: RootViewModel): TemplateResult {
  return html`<div class="root">
    <div class="toolbar-and-sidebar-layout">
      <div class="toolbar">
        <!-- TODO: このボタンはここではなく設定画面の中にあるべき -->
        <button @click=${onClickExportButton}>OPMLファイルをエクスポート</button>
        ${DataFolderPickerOpenButtonView()}
      </div>
      <div class="sidebar-layout">
        ${viewModel.leftSidebarViewModel !== undefined
          ? LeftSidebarView(viewModel.leftSidebarViewModel)
          : undefined}
        ${ItemTreeView(viewModel.itemTreeViewModel)}
      </div>
    </div>
    ${viewModel.webPageItemTitleSettingDialog !== undefined
      ? WebPageItemTitleSettingDialogView(viewModel.webPageItemTitleSettingDialog)
      : undefined}
  </div>`
}

function onClickExportButton() {
  const fileName = 'treeify.opml'

  const content = toOpmlString(TOP_ITEM_ID)
  const aElement = document.createElement('a')
  aElement.href = window.URL.createObjectURL(new Blob([content], {type: 'application/xml'}))
  aElement.download = fileName
  aElement.click()
}
