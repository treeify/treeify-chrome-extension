import {List} from 'immutable'
import {parse, unparse} from 'papaparse'
import {ItemId} from 'src/TreeifyTab/basicType'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyTab/Internal/DomishObject'
import {extractPlainText} from 'src/TreeifyTab/Internal/ImportExport/indentedText'
import {Internal} from 'src/TreeifyTab/Internal/Internal'

/**
 * タブ区切り形式（Tab Separated Values）のテーブルを表すテキストかどうかを判定し、
 * もしテーブルだと判断すれば対応する項目を作成する。
 */
export function tryParseAsTsvTable(possiblyTsv: string): ItemId | undefined {
  const result = parse(possiblyTsv, {delimiter: '\t'})
  if (result.errors.length > 0) return undefined

  const rows = result.data as string[][]

  // rowごとにcolumn数が不揃いだった場合はリジェクトする。
  // また、row数が0のケースもこの判定式でリジェクトされる。
  const columnCounts = List(rows).map((row) => row.length)
  if (columnCounts.toSet().size !== 1) return undefined

  // column数が2未満の場合はリジェクト。単なる改行付きテキストなどを弾くため。
  if (columnCounts.first(undefined)! < 2) return undefined

  // row数が2未満の場合はリジェクト
  if (rows.length < 2) return undefined

  // 以後、テーブルと認識して項目を作成する
  const rootItemId = CurrentState.createTextItem()
  for (const row of rows) {
    const rowItemId = CurrentState.createTextItem()
    for (const cellText of row) {
      const cellItemId = CurrentState.createTextItem()
      CurrentState.setTextItemDomishObjects(cellItemId, DomishObject.fromPlainText(cellText))
      CurrentState.insertLastChildItem(rowItemId, cellItemId)
    }
    CurrentState.insertLastChildItem(rootItemId, rowItemId)
  }
  CurrentState.setView(rootItemId, {type: 'table'})
  return rootItemId
}

export function toCsvText(itemId: ItemId, delimiter?: string): string {
  const state = Internal.instance.state
  const rows = state.items[itemId].childItemIds.toArray().map((childItemId) => {
    const grandchildren = state.items[childItemId].childItemIds.toArray()
    return grandchildren.map((grandchild) => {
      return extractPlainText(List.of(grandchild))
    })
  })
  return unparse(rows, {delimiter})
}
