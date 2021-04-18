import UAParser from 'ua-parser-js'

/**
 * キーボードまたはマウスからの入力の種類を一意に表す型。
 * 例えばShiftキーを押しながらSpaceキーを押した場合、"0100Space"となる。
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
    if (new UAParser().getOS().name !== 'Mac OS') {
      return [
        event.ctrlKey ? '1' : '0',
        event.shiftKey ? '1' : '0',
        event.altKey ? '1' : '0',
        event.metaKey ? '1' : '0',
      ].join('')
    } else {
      return [
        event.metaKey ? '1' : '0',
        event.shiftKey ? '1' : '0',
        event.altKey ? '1' : '0',
        event.ctrlKey ? '1' : '0',
      ].join('')
    }
  }
}
