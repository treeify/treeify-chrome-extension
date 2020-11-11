import {List} from 'immutable'
import {assertNeverType} from 'src/Common/Debug/assert'

/**
 * DOM要素っぽいオブジェクトの型。
 * contenteditableな要素のinnerHTMLを安全に扱うために導入した。
 */
export type DomishObject = DomishObject.Element | DomishObject.TextNode

export namespace DomishObject {
  export type Element = BElement | UElement | IElement | BRElement

  export type BElement = {
    type: 'b'
    children: List<DomishObject>
  }
  export type UElement = {
    type: 'u'
    children: List<DomishObject>
  }
  export type IElement = {
    type: 'i'
    children: List<DomishObject>
  }

  export type BRElement = {
    type: 'br'
  }

  export type TextNode = {
    type: 'text'
    textContent: string
  }

  /**
   * DomishObjectをDOM要素に変換する。
   * 本来ならlit-htmlで描画したいところだが、contenteditableな要素のinnerHTMLをlit-htmlで描画すると編集時にエラーが出てしまう。
   * https://github.com/Polymer/lit-html/issues/293#issuecomment-421491355
   */
  export function toDocumentFragment(value: DomishObject | List<DomishObject>): DocumentFragment {
    const templateElement = document.createElement('template')
    templateElement.innerHTML = toHtml(value)
    return templateElement.content
  }

  // DomishObjectをHTML文字列に変換する
  function toHtml(value: DomishObject | List<DomishObject>): string {
    if (value instanceof List) {
      const domishObjects = value as List<DomishObject>
      return domishObjects.map(toHtml).join('')
    } else {
      const domishObject = value as DomishObject
      switch (domishObject.type) {
        case 'b':
          return `<b>${toHtml(domishObject.children)}</b>`
        case 'u':
          return `<u>${toHtml(domishObject.children)}</u>`
        case 'i':
          return `<i>${toHtml(domishObject.children)}</i>`
        case 'br':
          return `<br>`
        case 'text':
          return domishObject.textContent
        default:
          assertNeverType(domishObject)
      }
    }
  }

  /**
   * 与えられたNodeの子リストをDomishObjectのリストに変換する。
   * DomishObjectとして表せない子Nodeは無視される。
   */
  export function fromChildren(node: Node): List<DomishObject> {
    return List(Array.from(node.childNodes))
      .map(from)
      .filter((value) => value !== undefined) as List<DomishObject>
  }

  /**
   * 与えられたNodeをDomishObjectに変換する。
   * DomishObjectとして表せない場合はundefinedを返す。
   */
  export function from(node: Node): DomishObject | undefined {
    if (node instanceof HTMLBRElement) {
      return {type: 'br'}
    }
    if (node.nodeType === Node.TEXT_NODE) {
      return {type: 'text', textContent: node.textContent ?? ''}
    }
    if (node instanceof HTMLElement) {
      switch (node.tagName.toLowerCase()) {
        case 'b':
          return {
            type: 'b',
            children: fromChildren(node),
          }
        case 'u':
          return {
            type: 'u',
            children: fromChildren(node),
          }
        case 'i':
          return {
            type: 'i',
            children: fromChildren(node),
          }
      }
      return undefined
    }
    return undefined
  }
}
