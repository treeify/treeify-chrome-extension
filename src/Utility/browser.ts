import Color from 'color'
import { integer } from 'src/Utility/integer'

export namespace CssCustomProperty {
  /**
   * CSSカスタムプロパティとして定義された色を返す。
   * @param propertyName "--"も含むプロパティ名
   */
  export function getColor(propertyName: string): Color {
    return Color(getValue(propertyName).trim())
  }

  /**
   * CSSカスタムプロパティとして定義された数値を返す。
   * @param propertyName "--"も含むプロパティ名
   */
  export function getNumber(propertyName: string): number | undefined {
    try {
      const number = parseFloat(getValue(propertyName).trim())
      if (isNaN(number)) {
        return undefined
      }
      return number
    } catch {
      return undefined
    }
  }

  /**
   * CSSカスタムプロパティの値を返す。
   * 先頭の空白も含む完全な文字列を返す。
   * @param propertyName "--"も含むプロパティ名
   */
  export function getValue(propertyName: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(propertyName)
  }
}

/**
 * chrome.tabs.Tab型のidプロパティ用の型。
 * 可読性のために導入。
 */
export type TabId = integer
