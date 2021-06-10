import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'

export namespace ItemTreeContentView {
  /** DOM描画後にフォーカスを設定するために用いる */
  export function focusableDomElementId(itemPath: ItemPath): string {
    return `focusable:${JSON.stringify(itemPath)}`
  }
}
