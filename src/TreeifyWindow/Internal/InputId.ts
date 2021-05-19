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
    if (new UAParser().getOS().name !== 'Mac OS') {
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
    if (new UAParser().getOS().name !== 'Mac OS') {
      return event.metaKey
    } else {
      return event.ctrlKey
    }
  }
}
