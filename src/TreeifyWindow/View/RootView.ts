import {html, TemplateResult} from 'lit-html'
import {TOP_ITEM_ID} from 'src/TreeifyWindow/basicType'
import {toOpmlString} from 'src/TreeifyWindow/Internal/importAndExport'
import {State} from 'src/TreeifyWindow/Internal/State'
import {css} from 'src/TreeifyWindow/View/css'
import {
  createDataFolderPickerOpenButtonViewModel,
  DataFolderPickerOpenButtonView,
  DataFolderPickerOpenButtonViewModel,
} from 'src/TreeifyWindow/View/DataFolderPickerOpenButtonView'
import {
  CodeBlockItemEditDialogView,
  CodeBlockItemEditDialogViewModel,
  createCodeBlockItemEditDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/CodeBlockItemEditDialog'
import {
  createWebPageItemTitleSettingDialogViewModel,
  WebPageItemTitleSettingDialogView,
  WebPageItemTitleSettingDialogViewModel,
} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialog'
import {FullWindowModeButtonView} from 'src/TreeifyWindow/View/FullWindowModeButtonView'
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
  codeBlockItemEditDialogViewModel: CodeBlockItemEditDialogViewModel | undefined
  dataFolderPickerOpenButtonViewModel: DataFolderPickerOpenButtonViewModel
}

export function createRootViewModel(state: State): RootViewModel {
  return {
    leftSidebarViewModel: createLeftSidebarViewModel(state),
    itemTreeViewModel: createItemTreeViewModel(state),
    webPageItemTitleSettingDialog: createWebPageItemTitleSettingDialogViewModel(state),
    dataFolderPickerOpenButtonViewModel: createDataFolderPickerOpenButtonViewModel(),
    codeBlockItemEditDialogViewModel: createCodeBlockItemEditDialogViewModel(state),
  }
}

/** html-litによる動的描画が行われる領域全体のルートView */
export function RootView(viewModel: RootViewModel): TemplateResult {
  return html`<div class="root">
    <div class="toolbar-and-sidebar-layout">
      <div class="toolbar">
        <!-- TODO: このボタンはここではなく設定画面の中にあるべき -->
        <button @click=${onClickExportButton}>OPMLファイルをエクスポート</button>
        ${FullWindowModeButtonView()}
        ${DataFolderPickerOpenButtonView(viewModel.dataFolderPickerOpenButtonViewModel)}
      </div>
      <div class="sidebar-layout">
        ${viewModel.leftSidebarViewModel !== undefined
          ? LeftSidebarView(viewModel.leftSidebarViewModel)
          : html`<div class="grid-empty-cell"></div>`}
        ${ItemTreeView(viewModel.itemTreeViewModel)}
      </div>
    </div>
    ${viewModel.webPageItemTitleSettingDialog !== undefined
      ? WebPageItemTitleSettingDialogView(viewModel.webPageItemTitleSettingDialog)
      : undefined}
    ${viewModel.codeBlockItemEditDialogViewModel !== undefined
      ? CodeBlockItemEditDialogView(viewModel.codeBlockItemEditDialogViewModel)
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

export const RootCss = css`
  :root {
    /* ツールバーの高さ */
    --toolbar-height: 36px;
    /* ツールバーの背景 */
    --toolbar-background: hsl(0, 0%, 96%);

    /* ツールバーのボタンのサイズ（正方形の一辺の長さ） */
    --toolbar-icon-button-size: 32px;
    /* ツールバーのボタンのマウスホバー時の背景 */
    --toolbar-icon-button-hover-background: hsl(0, 0%, 90%);
  }

  * {
    box-sizing: border-box;
  }

  html {
    height: 100%;
  }

  body {
    height: 100%;
    margin: 0;
  }

  .spa-root {
    height: 100%;
  }

  .root {
    height: 100%;
    /* ダイアログなどを他の表示物に重ねて表示するための設定 */
    position: relative;
  }

  /*
  ツールバーとその他の領域を縦に並べるためのレイアウト。
  「その他の領域」と言ってもダイアログなどの浮いた存在は含めない（フローティングサイドバーは浮いているがここに含む）。
  */
  .toolbar-and-sidebar-layout {
    /* スクロールされてもツールバーを常に画面上部に表示し続けるための設定 */
    height: 100%;

    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .toolbar {
    /* ボタンなどを横に並べる */
    display: flex;
    align-items: center;
    justify-content: flex-end;

    /* 左サイドバーにも影が落ちるように左サイドバーより高くする */
    position: relative;
    z-index: 2;

    height: var(--toolbar-height);

    background: var(--toolbar-background);
    /* Dynalistを参考にしながら調整した影 */
    box-shadow: 0 1.5px 3px hsl(0, 0%, 85%);
  }

  /* ツールバーのアイコンボタンの共通クラス */
  .toolbar-icon-button {
    width: var(--toolbar-icon-button-size);
    height: var(--toolbar-icon-button-size);
    border-radius: 50%;

    cursor: pointer;

    /* アイコンと疑似リップルエフェクトを中央寄せにする */
    position: relative;
  }
  .toolbar-icon-button:hover {
    background: var(--toolbar-icon-button-hover-background);
  }
  /* ツールバーのボタンの疑似リップルエフェクトの終了状態 */
  .toolbar-icon-button::after {
    content: '';

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s, width 0.5s, height 0.5s;

    border-radius: 50%;

    background: hsl(0, 0%, 50%);
  }
  /* ツールバーのボタンの疑似リップルエフェクトの開始状態 */
  .toolbar-icon-button:active::after {
    width: 0;
    height: 0;
    opacity: 0.5;
    transition: opacity 0s, width 0s, height 0s;
  }

  /* 左サイドバーとアイテムツリーを横に並べるレイアウト */
  .sidebar-layout {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }
`
