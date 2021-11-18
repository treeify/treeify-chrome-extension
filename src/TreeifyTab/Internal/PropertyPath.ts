import { List } from 'immutable'

/**
 * Stateオブジェクト内の特定の位置を示す値の型。
 * 例えばstate.items[0].childItemIdsというプロパティを指すPropertyPathは、
 * 'items~0~childItemIds'
 * である。
 */
export type PropertyPath = string

export namespace PropertyPath {
  // 基本的にはどんな記号でもいいはずだが予期せぬ不具合や杞憂を防ぐために次の記号を避けた。
  // ・JavaScriptの識別子として出現しうる'_', '$'
  // ・数値の文字列表現として一般に出現しうる'-', '+', '.', ','
  // ・ファイル名として使えない'/', ':'など
  const delimiter = '~'

  export function of(...args: (keyof any)[]): PropertyPath {
    return List.of(...args)
      .map((value) => value.toString())
      .join(delimiter)
  }

  export function splitToPropertyKeys(propertyPath: PropertyPath): List<string> {
    return List(propertyPath.split(delimiter))
  }
}
