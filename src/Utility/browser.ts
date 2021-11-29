import Color from 'color'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
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

/**
 * タブを強制的に閉じる。
 * chrome.tabs.removeでは一部のウェブページを閉じる際に確認ダイアログが出て、キャンセルボタンを押下すると閉じられない。
 * この関数はdiscardしてからremoveすることでそのダイアログが出ずにタブを閉じられる現象を利用している。
 * chrome.tabs.removeで確認ダイアログが出るウェブページの例：https://www.primaldraw.com/
 */
export async function forceCloseTab(tabId: TabId) {
  const tab = await chrome.tabs.discard(tabId)
  assertNonUndefined(tab.id)
  await chrome.tabs.remove(tab.id)
}
