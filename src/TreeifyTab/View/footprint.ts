import Color from 'color'
import { CssCustomProperty } from 'src/Utility/browser'
import { integer } from 'src/Utility/integer'

/** 足跡の色を計算する */
export function calculateFootprintColor(
  footprintRank: integer | undefined,
  footprintCount: integer,
  strongestFootprintColor: string,
  weakestFootprintColor: string
): Color | undefined {
  if (footprintRank === undefined) return undefined

  const strongestColor = CssCustomProperty.getColor(strongestFootprintColor)
  const weakestColor = CssCustomProperty.getColor(weakestFootprintColor)

  if (footprintCount === 1) {
    return strongestColor
  }

  // 線形補間する
  const ratio = footprintRank / (footprintCount - 1)
  return strongestColor.mix(weakestColor, ratio)
}
