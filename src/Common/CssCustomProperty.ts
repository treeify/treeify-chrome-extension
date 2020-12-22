import Color = require('color')

export namespace CssCustomProperty {
  /**
   * CSSカスタムプロパティの色を返す。
   * @param propertyName "--"も含むプロパティ名
   */
  export function getColor(propertyName: string): Color {
    return Color(getValue(propertyName).trim())
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
