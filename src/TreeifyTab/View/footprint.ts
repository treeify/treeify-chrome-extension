import Color from 'color'
import { CssCustomProperty } from 'src/Utility/browser'
import { integer } from 'src/Utility/integer'

/**
 * 足跡の色を計算する
 * TODO: 現状では第3、第4引数の実引数が全て同じなので意味がない
 */
export function calculateFootprintColor(
  footprintRank: integer | undefined,
  footprintCount: integer,
  newestFootprintColorName: string,
  oldestFootprintColorName: string
): Color | undefined {
  if (footprintRank === undefined) return undefined

  const newestColor = CssCustomProperty.getColor(newestFootprintColorName)
  const oldestColor = CssCustomProperty.getColor(oldestFootprintColorName)

  if (footprintCount === 1) {
    return newestColor
  }

  // 線形補間する
  const ratio = footprintRank / (footprintCount - 1)
  return newestColor.mix(oldestColor, ratio)
}
