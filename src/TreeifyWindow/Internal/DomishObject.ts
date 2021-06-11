import {assert} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'

export namespace DomishObject {
  /**
   * 与えられたNodeの子リストをDomishObjectのリストに変換する。
   * DomishObjectとして表せない子Nodeは無視される。
   * TODO: 引数の型をElementにできないか？
   */
  export function fromChildren(node: Node): string {
    assert(node instanceof Element)
    return ((node as unknown) as Element).innerHTML
  }

  /** 改行（br要素）を含む文字数を返す */
  export function countCharacters(innerHtml: string): integer {
    return toSingleLinePlainText(innerHtml).length
  }

  /** プレーンテキストに変換する。改行は維持される。 */
  export function toPlainText(innerHtml: string): string {
    return toDocumentFragment(innerHtml).textContent ?? ''
  }

  /**
   * 単一行のプレーンテキストに変換する。リッチテキスト要素は無視される。
   * br要素は半角スペースに変換する。
   */
  export function toSingleLinePlainText(innerHtml: string): string {
    return toPlainText(innerHtml).replace(/\r?\n/, ' ')
  }

  export function toDocumentFragment(innerHtml: string): DocumentFragment {
    const templateElement = document.createElement('template')
    templateElement.innerHTML = innerHtml
    return templateElement.content
  }
}
