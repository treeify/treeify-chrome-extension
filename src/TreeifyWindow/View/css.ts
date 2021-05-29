import {List} from 'immutable'
import {DataFolderPickerOpenButtonCss} from 'src/TreeifyWindow/View/DataFolderPickerOpenButtonView'
import {CodeBlockItemEditDialogCss} from 'src/TreeifyWindow/View/Dialog/CodeBlockItemEditDialogView'
import {CommonDialogCss} from 'src/TreeifyWindow/View/Dialog/CommonDialogView'
import {DefaultWindowModeSettingDialogCss} from 'src/TreeifyWindow/View/Dialog/DefaultWindowModeSettingDialogView'
import {LabelEditDialogCss} from 'src/TreeifyWindow/View/Dialog/LabelEditDialogView'
import {OtherParentsDialogCss} from 'src/TreeifyWindow/View/Dialog/OtherParentsDialogView'
import {WebPageItemTitleSettingDialogCss} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialogView'
import {WorkspaceDialogCss} from 'src/TreeifyWindow/View/Dialog/WorkspaceDialogView'
import {FullWindowModeButtonCss} from 'src/TreeifyWindow/View/FullWindowModeButtonView'
import {ItemTreeCodeBlockContentCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeCodeBlockContentView'
import {ItemTreeImageContentCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeImageContentView'
import {ItemTreeNodeCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeNodeView'
import {ItemTreeSpoolCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeSpoolView'
import {ItemTreeTextContentCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeTextContentView'
import {ItemTreeCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeView'
import {ItemTreeWebPageContentCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeWebPageContentView'
import {LabelCss} from 'src/TreeifyWindow/View/LabelView'
import {LeftSidebarCss} from 'src/TreeifyWindow/View/LeftSidebar/LeftSidebarView'
import {PageTreeBulletAndIndentCss} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeBulletAndIndentView'
import {PageTreeNodeCss} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeNodeView'
import {PageTreeCss} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeView'
import {PageTreeWebPageContentCss} from 'src/TreeifyWindow/View/LeftSidebar/PageTreeWebPageContentView'
import {RootCss} from 'src/TreeifyWindow/View/RootView'

/**
 *  WebStormでCSSのシンタックスハイライトや入力補完を効かせるためリネームされた関数。
 *  （cssという名前だと後続のテンプレートリテラルがcssだと認識される模様）
 *
 *  次のように定義するとなぜかエラーになったのでわざわざfunctionで定義している。
 *  export const css = html
 */
export function css(template: TemplateStringsArray, ...substitutions: any[]): string {
  return String.raw(template, ...substitutions)
}

export function generateStyleElementContents() {
  return List.of(
    RootCss,
    FullWindowModeButtonCss,
    DataFolderPickerOpenButtonCss,
    LeftSidebarCss,
    PageTreeCss,
    PageTreeNodeCss,
    PageTreeBulletAndIndentCss,
    PageTreeWebPageContentCss,
    ItemTreeCss,
    ItemTreeNodeCss,
    ItemTreeSpoolCss,
    ItemTreeTextContentCss,
    ItemTreeWebPageContentCss,
    ItemTreeImageContentCss,
    ItemTreeCodeBlockContentCss,
    LabelCss,
    CommonDialogCss,
    WebPageItemTitleSettingDialogCss,
    CodeBlockItemEditDialogCss,
    DefaultWindowModeSettingDialogCss,
    WorkspaceDialogCss,
    LabelEditDialogCss,
    OtherParentsDialogCss
  ).join('\n')
}
