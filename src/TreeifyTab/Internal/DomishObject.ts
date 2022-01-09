import { pipe } from 'fp-ts/function'
import { assertNeverType } from 'src/Utility/Debug/assert'
import { RArray$ } from 'src/Utility/fp-ts'
import { integer } from 'src/Utility/integer'

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
    children: RArray$.T<DomishObject>
  }
  export type UElement = {
    type: 'u'
    children: RArray$.T<DomishObject>
  }
  export type IElement = {
    type: 'i'
    children: RArray$.T<DomishObject>
  }
  export type StrikeElement = {
    type: 'strike'
    children: RArray$.T<DomishObject>
  }

  export type BRElement = {
    type: 'br'
  }

  export type TextNode = {
    type: 'text'
    textContent: string
  }

  // いわゆる「&nbsp;」
  const nbsp = String.fromCharCode(160)

  /** DomishObjectをHTML文字列に変換する */
  export function toHtml(value: DomishObject | RArray$.T<DomishObject>): string {
    if (value instanceof Array) {
      return value.map(toHtml).join('')
    } else {
      const domishObject = value
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
          return escape(domishObject.textContent)
        default:
          assertNeverType(domishObject)
      }
    }
  }

  /** HTML文字列をDomishObjectに変換する */
  export function fromHtml(html: string): RArray$.T<DomishObject> {
    const templateElement = document.createElement('template')
    templateElement.innerHTML = html
    return DomishObject.fromChildren(templateElement.content)
  }

  /**
   * 与えられたNodeの子リストをDomishObjectのリストに変換する。
   * DomishObjectとして表せない子Nodeは無視される。
   */
  export function fromChildren(node: Node): RArray$.T<DomishObject> {
    return pipe(Array.from(node.childNodes), RArray$.map(from), RArray$.filterUndefined)
  }

  /**
   * 与えられたNodeをDomishObjectに変換する。
   * DomishObjectとして表せない場合はundefinedを返す。
   */
  export function from(node: Node): DomishObject | undefined {
    if (node instanceof HTMLBRElement) {
      return { type: 'br' }
    }
    if (node.nodeType === Node.TEXT_NODE) {
      // 通常の半角スペースをいわゆる「&nbsp;」に変換してからテキストノード化する
      const textContent = node.textContent ?? ''
      return { type: 'text', textContent: textContent.replaceAll(' ', nbsp) }
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
  export function countCharacters(value: DomishObject | RArray$.T<DomishObject>): integer {
    return toPlainText(value).length
  }

  /**
   * プレーンテキストに変換する。
   * br要素は改行コードに変換する。
   * nbspは半角スペースに変換する。
   * ただし末尾の無駄な（すなわちHTMLへの描画時に改行として扱われない）br要素は除去するので要注意。
   */
  export function toPlainText(value: DomishObject | RArray$.T<DomishObject>): string {
    const plainText = _toPlainText(value)
    return plainText.replace(/\r?\n$/, '')
  }

  function _toPlainText(value: DomishObject | RArray$.T<DomishObject>): string {
    if (value instanceof Array) {
      return value.map(_toPlainText).join('')
    } else {
      const domishObject = value
      switch (domishObject.type) {
        case 'b':
        case 'u':
        case 'i':
        case 'strike':
          return _toPlainText(domishObject.children)
        case 'br':
          return '\n'
        case 'text':
          return domishObject.textContent.replaceAll(nbsp, ' ')
        default:
          assertNeverType(domishObject)
      }
    }
  }

  export function fromPlainText(text: string): RArray$.T<DomishObject> {
    const domishObjectArray: DomishObject[] = []
    const lines = text.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      // 通常の半角スペースをいわゆる「&nbsp;」に変換してからテキストノード化する
      const line = lines[i].replaceAll(' ', nbsp)
      domishObjectArray.push({ type: 'text', textContent: line })
      if (i !== lines.length - 1) {
        domishObjectArray.push({ type: 'br' })
      }
    }
    return domishObjectArray
  }

  /**
   * Markdown形式のテキストを生成する。
   * テキスト項目内の改行は空白スペース2つ+改行に変換する。
   */
  export function toMultiLineMarkdownText(value: DomishObject | RArray$.T<DomishObject>): string {
    if (value instanceof Array) {
      return value.map(toMultiLineMarkdownText).join('')
    } else {
      const domishObject = value as DomishObject
      switch (domishObject.type) {
        case 'b':
          return `**${toMultiLineMarkdownText(domishObject.children)}**`
        case 'u':
          return `<u>${toMultiLineMarkdownText(domishObject.children)}</u>`
        case 'i':
          return `*${toMultiLineMarkdownText(domishObject.children)}*`
        case 'strike':
          return `~~${toMultiLineMarkdownText(domishObject.children)}~~`
        case 'br':
          return '  \n'
        case 'text':
          return domishObject.textContent.replaceAll(nbsp, ' ')
        default:
          assertNeverType(domishObject)
      }
    }
  }

  /**
   * Markdown形式のテキストを生成する。
   * テキスト項目内の改行は半角スペース1つに置換する。
   */
  export function toSingleLineMarkdownText(value: DomishObject | RArray$.T<DomishObject>): string {
    if (value instanceof Array) {
      return value.map(toSingleLineMarkdownText).join('')
    } else {
      const domishObject = value as DomishObject
      switch (domishObject.type) {
        case 'b':
          return `**${toSingleLineMarkdownText(domishObject.children)}**`
        case 'u':
          return `<u>${toSingleLineMarkdownText(domishObject.children)}</u>`
        case 'i':
          return `*${toSingleLineMarkdownText(domishObject.children)}*`
        case 'strike':
          return `~~${toSingleLineMarkdownText(domishObject.children)}~~`
        case 'br':
          return ' '
        case 'text':
          return domishObject.textContent.replaceAll(nbsp, ' ')
        default:
          assertNeverType(domishObject)
      }
    }
  }

  /**
   * プレーンテキストかどうかを判定する。
   * 改行はプレーンテキストとして扱う。
   */
  export function isPlainText(domishObjects: RArray$.T<DomishObject>): boolean {
    for (const domishObject of domishObjects) {
      switch (domishObject.type) {
        case 'b':
        case 'u':
        case 'i':
        case 'strike':
          return false
        case 'br':
        case 'text':
          break
        default:
          assertNeverType(domishObject)
      }
    }
    return true
  }

  function escape(plainText: string): string {
    const divElement = document.createElement('div')
    divElement.innerText = plainText
    return divElement.innerHTML
  }

  export function replace(
    domishObject: DomishObject,
    beforeReplace: string,
    afterReplace: string
  ): DomishObject {
    switch (domishObject.type) {
      case 'br':
        return domishObject
      case 'b':
      case 'u':
      case 'i':
      case 'strike':
        return {
          type: domishObject.type,
          children: domishObject.children.map((child) =>
            replace(child, beforeReplace, afterReplace)
          ),
        }
      case 'text':
        return {
          type: 'text',
          textContent: domishObject.textContent.replaceAll(beforeReplace, afterReplace),
        }
    }
  }

  /** 半角スペースまたはnbspをbrに変換する */
  export function convertSpaceToNewline(
    value: DomishObject | RArray$.T<DomishObject>
  ): RArray$.T<DomishObject> {
    if (value instanceof Array) {
      return value.flatMap(convertSpaceToNewline)
    } else {
      const domishObject = value as DomishObject
      switch (domishObject.type) {
        case 'br':
          return [domishObject]
        case 'b':
        case 'u':
        case 'i':
        case 'strike':
          const newDomishObject: DomishObject = {
            type: domishObject.type,
            children: domishObject.children.flatMap(convertSpaceToNewline),
          }
          return [newDomishObject]
        case 'text':
          // 半角スペースまたはnbspでsplit
          const lines = domishObject.textContent.split(/[ \u00A0]/)
          const rarray = lines.map((text) => {
            return {
              type: 'text',
              textContent: text,
            } as DomishObject
          })
          return RArray$.join(rarray, { type: 'br' })
      }
    }
  }
}
