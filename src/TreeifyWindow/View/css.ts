import {html, TemplateResult} from 'lit-html'
import {WebPageItemTitleSettingDialogCss} from 'src/TreeifyWindow/View/Dialog/WebPageItemTitleSettingDialog'
import {ItemTreeImageContentCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeImageContentView'
import {ItemTreeNodeViewCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeNodeView'
import {ItemTreeSpoolViewCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeSpoolView'
import {ItemTreeTextContentCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeTextContentView'
import {ItemTreeViewCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeView'
import {ItemTreeWebPageContentCss} from 'src/TreeifyWindow/View/ItemTree/ItemTreeWebPageContentView'
import {LeftSidebarViewCss} from 'src/TreeifyWindow/View/LeftSidebar/LeftSidebarView'
import {RootViewCss} from 'src/TreeifyWindow/View/RootView'

/**
 *  WebStormでCSSのシンタックスハイライトや入力補完を効かせるためリネームされた関数。
 *  （cssという名前だと後続のテンプレートリテラルがcssだと認識される模様）
 *
 *  次のように定義するとなぜかエラーになったのでわざわざfunctionで定義している。
 *  export const css = html
 */
export function css(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult {
  return html(strings, ...values)
}

export function generateStyleElementContents() {
  return css`
    ${RootViewCss}
    ${LeftSidebarViewCss}
    ${ItemTreeViewCss}
    ${ItemTreeNodeViewCss}
    ${ItemTreeSpoolViewCss}
    ${ItemTreeTextContentCss}
    ${ItemTreeWebPageContentCss}
    ${ItemTreeImageContentCss}
    ${WebPageItemTitleSettingDialogCss}
  `
}
