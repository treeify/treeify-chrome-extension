import {List} from 'immutable'
import {integer} from 'src/Common/integer'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'

/** プレーンテキストとそれに対する装飾情報からなるオブジェクトの型 */
export type MarkedupText = {
  text: string
  styles: List<TextStyle>
}

export type TextStyle = {
  /** 装飾の種類を表す文字列 */
  type: 'bold' | 'italic' | 'underline' | 'strikethrough'
  /** プレーンテキスト内での最初の装飾対象文字のindex */
  start: integer
  /** プレーンテキスト内での最後の装飾対象文字のindex + 1 */
  end: integer
}

export namespace MarkedupText {
  type StyleType = TextStyle['type']

  const tagNameToTextStyleType: {[K in string]: StyleType} = {
    b: 'bold',
    i: 'italic',
    u: 'underline',
    strike: 'strikethrough',
  }

  /** stringからMarkedupTextに変換する */
  export function from(innerHtml: string): MarkedupText {
    const recorder: Recorder = {
      position: 0,
      texts: [],
      styles: [],
    }
    for (const node of DomishObject.toDocumentFragment(innerHtml).childNodes) {
      traverseWithRecording(node, recorder)
    }
    return {
      text: recorder.texts.join(''),
      styles: List(recorder.styles),
    }
  }

  // stringからMarkedupTextへの変換処理で用いる特殊なオブジェクトの型。
  // 再帰探索関数の引数として引き回され、ミューテーションされまくる。
  type Recorder = {
    position: integer
    texts: string[]
    styles: TextStyle[]
  }

  function traverseWithRecording(node: Node, recorder: Recorder) {
    if (node instanceof HTMLElement) {
      switch (node.tagName) {
        case 'b':
        case 'u':
        case 'i':
        case 'strike':
          const start = recorder.position
          for (const child of node.children) {
            traverseWithRecording(child, recorder)
          }
          const end = recorder.position
          const type = tagNameToTextStyleType[node.tagName]
          recorder.styles.push({type, start, end})
          break
        case 'br':
          recorder.texts.push('\n')
          recorder.position++
          break
        default:
        // TODO: エラー処理
      }
    } else if (node instanceof Text) {
      const textContent = node.textContent ?? ''
      recorder.texts.push(textContent)
      recorder.position += textContent.length
    } else {
      // TODO: エラー処理
    }
  }
}
