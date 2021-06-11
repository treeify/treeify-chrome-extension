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
    children: string
  }
  export type UElement = {
    type: 'u'
    children: string
  }
  export type IElement = {
    type: 'i'
    children: string
  }
  export type StrikeElement = {
    type: 'strike'
    children: string
  }

  export type BRElement = {
    type: 'br'
  }

  export type TextNode = {
    type: 'text'
    textContent: string
  }

  /**
   * 与えられたNodeの子リストをDomishObjectのリストに変換する。
   * DomishObjectとして表せない子Nodeは無視される。
   */
  export function fromChildren(node: Node): string {
    return List(Array.from(node.childNodes))
      .map(from)
      .filter((value) => value !== undefined) as string
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
  export function countCharacters(value: DomishObject | string): integer {
    if (value instanceof List) {
      const innerHtml = value as string
      return innerHtml.map(countCharacters).reduce((a: integer, x) => a + x, 0)
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
  export function toPlainText(value: DomishObject | string): string {
    if (value instanceof List) {
      const innerHtml = value as string
      return innerHtml.map(toPlainText).join('')
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
  export function toSingleLinePlainText(value: DomishObject | string): string {
    if (value instanceof List) {
      const innerHtml = value as string
      return innerHtml.map(toSingleLinePlainText).join('')
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
