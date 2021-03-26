import {integer} from 'src/Common/basicType'
import {DomishObject} from 'src/Common/DomishObject'
import {List} from 'immutable'
import {assertNeverType} from 'src/Common/Debug/assert'

/** プレーンテキストとそれに対する装飾情報からなるオブジェクトの型 */
export type MarkedupText = {
  text: string
  styles: List<TextStyle>
}

export type TextStyle = {
  /** 装飾の種類を表す文字列 */
  type: DomishObject.MarkupElement['type']
  /** プレーンテキスト内での最初の装飾対象文字のindex */
  start: integer
  /** プレーンテキスト内での最後の装飾対象文字のindex + 1 */
  end: integer
}

export namespace MarkedupText {
  /** List<DomishObject>からMarkedupTextに変換する */
  export function from(domishObjects: List<DomishObject>): MarkedupText {
    const recorder: Recorder = {
      position: 0,
      texts: [],
      styles: [],
    }
    for (const domishObject of domishObjects) {
      traverseWithRecording(domishObject, recorder)
    }
    return {
      text: recorder.texts.join(''),
      styles: List(recorder.styles),
    }
  }

  // List<DomishObject>からMarkedupTextへの変換処理で用いる特殊なオブジェクトの型。
  // 再帰探索関数の引数として引き回され、ミューテーションされまくる。
  type Recorder = {
    position: integer
    texts: string[]
    styles: TextStyle[]
  }

  function traverseWithRecording(domishObject: DomishObject, recorder: Recorder) {
    switch (domishObject.type) {
      case 'b':
      case 'u':
      case 'i':
      case 'strike':
        const start = recorder.position
        for (const child of domishObject.children) {
          traverseWithRecording(child, recorder)
        }
        const end = recorder.position
        recorder.styles.push({type: domishObject.type, start, end})
        break
      case 'br':
        recorder.texts.push('\n')
        recorder.position++
        break
      case 'text':
        recorder.texts.push(domishObject.textContent)
        recorder.position += domishObject.textContent.length
        break
      default:
        assertNeverType(domishObject)
    }
  }
}
