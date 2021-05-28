/**
 * 当初はlit-htmlを使ってDOM要素を生成・描画していたが、
 * 動作がだんだん重くなる問題を解決できなかったので自作することにした。
 */
export function createElement(
  tagName: string,
  attributes: {[K in string]: string},
  children?: Iterable<Node | undefined>,
  eventListeners?: {[K in string]: (...args: any) => any}
): HTMLElement {
  const element = document.createElement(tagName)

  for (const attributeKey in attributes) {
    element.setAttribute(attributeKey, attributes[attributeKey])
  }

  // イベントリスナーを設定する
  for (const eventName in eventListeners) {
    element.addEventListener(eventName, eventListeners[eventName])
  }

  // 子要素を設定する
  if (children !== undefined) {
    for (const child of children) {
      if (child !== undefined) {
        element.appendChild(child)
      }
    }
  }

  return element
}

/**
 * 動的に変化するclass属性を定義するためのユーティリティ関数。
 * lit-htmlのclassMap関数と同じ。
 */
export function classMap(map: {[K in string]: boolean}): string {
  return Object.entries(map)
    .filter((entry) => entry[1])
    .map((entry) => entry[0])
    .join(' ')
}
