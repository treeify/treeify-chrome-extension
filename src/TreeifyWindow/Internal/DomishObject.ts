import {List} from 'immutable'
import {assertNeverType} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'

/**
 * DOM要素っぽいオブジェクトの型。
 * contenteditableな要素のinnerHTMLを安全に扱うために導入した。
 */
export type DomishObject = DomishObject.Element | DomishObject.TextNode

export namespace DomishObject {
  export type MarkupElement = BElement | UElement | IElement | StrikeElement
  export type Element = MarkupElement | BRElement

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
  export type StrikeElement = {
    type: 'strike'
    children: List<DomishObject>
  }

  export type BRElement = {
    type: 'br'
  }

  export type TextNode = {
    type: 'text'
    textContent: string
  }

  /** 等価性判定 */
  export function equals(lhs: List<DomishObject>, rhs: List<DomishObject>): boolean {
    return toDocumentFragment(lhs).isEqualNode(toDocumentFragment(rhs))
  }

  /** DomishObjectをDOM要素に変換する */
  export function toDocumentFragment(value: DomishObject | List<DomishObject>): DocumentFragment {
    const templateElement = document.createElement('template')
    if (value instanceof List) {
      const domishObjects = value as List<DomishObject>
      for (const node of domishObjects.map(toDomNode)) {
        templateElement.content.appendChild(node)
      }
    } else {
      const domishObject = value as DomishObject
      templateElement.content.appendChild(toDomNode(domishObject))
    }
    return templateElement.content
  }

  function toDomNode(domishObject: DomishObject): Node {
    switch (domishObject.type) {
      case 'b':
        const bElement = document.createElement('b')
        for (const child of domishObject.children) {
          bElement.appendChild(toDomNode(child))
        }
        return bElement
      case 'u':
        const uElement = document.createElement('u')
        for (const child of domishObject.children) {
          uElement.appendChild(toDomNode(child))
        }
        return uElement
      case 'i':
        const iElement = document.createElement('i')
        for (const child of domishObject.children) {
          iElement.appendChild(toDomNode(child))
        }
        return iElement
      case 'strike':
        const strikeElement = document.createElement('strike')
        for (const child of domishObject.children) {
          strikeElement.appendChild(toDomNode(child))
        }
        return strikeElement
      case 'br':
        return document.createElement('br')
      case 'text':
        return document.createTextNode(domishObject.textContent)
    }
  }

  /** DomishObjectをHTML文字列に変換する */
  export function toHtml(value: DomishObject | List<DomishObject>): string {
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
        case 'strike':
          return `<strike>${toHtml(domishObject.children)}</strike>`
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
        case 'strike':
          return {
            type: 'strike',
            children: fromChildren(node),
          }
      }
      return undefined
    }
    return undefined
  }

  /** 改行（br要素）を含む文字数を返す */
  export function countCharacters(value: DomishObject | List<DomishObject>): integer {
    if (value instanceof List) {
      const domishObjects = value as List<DomishObject>
      return domishObjects.map(countCharacters).reduce((a: integer, x) => a + x, 0)
    } else {
      const domishObject = value as DomishObject
      switch (domishObject.type) {
        case 'b':
        case 'u':
        case 'i':
        case 'strike':
          return countCharacters(domishObject.children)
        case 'br':
          return 1
        case 'text':
          return domishObject.textContent.length
        default:
          return assertNeverType(domishObject)
      }
    }
  }

  /** プレーンテキストに変換する。改行は維持される。 */
  export function toPlainText(value: DomishObject | List<DomishObject>): string {
    if (value instanceof List) {
      const domishObjects = value as List<DomishObject>
      return domishObjects.map(toPlainText).join('')
    } else {
      const domishObject = value as DomishObject
      switch (domishObject.type) {
        case 'b':
        case 'u':
        case 'i':
        case 'strike':
          return toPlainText(domishObject.children)
        case 'br':
          return '\n'
        case 'text':
          return domishObject.textContent
        default:
          assertNeverType(domishObject)
      }
    }
  }

  /**
   * 単一行のプレーンテキストに変換する。リッチテキスト要素は無視される。
   * br要素は半角スペースに変換する。
   */
  export function toSingleLinePlainText(value: DomishObject | List<DomishObject>): string {
    if (value instanceof List) {
      const domishObjects = value as List<DomishObject>
      return domishObjects.map(toSingleLinePlainText).join('')
    } else {
      const domishObject = value as DomishObject
      switch (domishObject.type) {
        case 'b':
        case 'u':
        case 'i':
        case 'strike':
          return toSingleLinePlainText(domishObject.children)
        case 'br':
          return ' '
        case 'text':
          return domishObject.textContent
        default:
          assertNeverType(domishObject)
      }
    }
  }
}
