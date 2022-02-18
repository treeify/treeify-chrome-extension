import UAParser from 'ua-parser-js'

/**
 * キーボードまたはマウスからの入力の種類を一意に表す型。
 * 例えばShiftキーを押しながらEnterキーを押した場合、'0100Enter'となる。
 *
 * 4桁の数字は、4種類の修飾キーがそれぞれ押されている(1)か押されていない(0)かを表す。
 * Windowsの場合
 *  1桁目：Ctrl
 *  2桁目：Shift
 *  3桁目：Alt
 *  4桁目：Windows
 * Macの場合
 *  1桁目：command
 *  2桁目：shift
 *  3桁目：option
 *  4桁目：control
 *
 * 5文字目以降の部分は、キーボード入力の場合はevent.keyの値、マウス入力の場合は`MouseButton${event.button}`となる。
 */
export type InputId = string

export namespace InputId {
  const isNotMac = new UAParser().getOS().name !== 'Mac OS'

  export function fromKeyboardEvent(event: KeyboardEvent): InputId {
    return getModifierKeysId(event) + event.code
  }

  export function fromMouseEvent(event: MouseEvent) {
    return getModifierKeysId(event) + `MouseButton${event.button}`
  }

  function getModifierKeysId(event: KeyboardEvent | MouseEvent): string {
    return [
      isFirstModifierKeyPressed(event) ? '1' : '0',
      event.shiftKey ? '1' : '0',
      event.altKey ? '1' : '0',
      isFourthModifierKeyPressed(event) ? '1' : '0',
    ].join('')
  }

  /**
   * 1番目の修飾キーが押されているかどうかを判定する。
   * 1番目の修飾キーとはWindowsではCtrlキー、MacではCommandキーのことを指す。
   */
  export function isFirstModifierKeyPressed(event: KeyboardEvent | MouseEvent): boolean {
    if (isNotMac) {
      return event.ctrlKey
    } else {
      return event.metaKey
    }
  }

  /**
   * 4番目の修飾キーが押されているかどうかを判定する。
   * 4番目の修飾キーとはWindowsではWindowsキー、MacではControlキーのことを指す。
   */
  export function isFourthModifierKeyPressed(event: KeyboardEvent | MouseEvent): boolean {
    if (isNotMac) {
      return event.metaKey
    } else {
      return event.ctrlKey
    }
  }

  export function toReadableText(inputId: InputId): string {
    const parts = []
    if (inputId[0] === '1') parts.push(getFirstModifierName())
    if (inputId[1] === '1') parts.push('Shift')
    if (inputId[2] === '1') parts.push(getThirdModifierName())
    if (inputId[3] === '1') parts.push(getFourthModifierName())

    parts.push(simplify(inputId.substring(4)))
    return parts.join(' + ')
  }

  function simplify(code: string): string {
    const map: Record<string, string | undefined> = {
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowRight: '→',
      ArrowLeft: '←',
      Comma: ',',
      Period: '.',
      Slash: '/',
      Semicolon: ';',
      Minus: '-',
      IntlYen: '¥',
    }
    const mapResult = map[code]
    if (mapResult !== undefined) return mapResult

    const key = /Key([A-Z])/.exec(code)
    if (key !== null) return key[1]

    const digit = /Digit([0-9])/.exec(code)
    if (digit !== null) return digit[1]

    return code
  }

  function getFirstModifierName(): string {
    if (isNotMac) {
      return 'Ctrl'
    } else {
      return 'Command'
    }
  }

  function getThirdModifierName(): string {
    if (isNotMac) {
      return 'Alt'
    } else {
      return 'Option'
    }
  }

  function getFourthModifierName(): string {
    if (isNotMac) {
      return 'Windows'
    } else {
      return 'Control'
    }
  }
}
