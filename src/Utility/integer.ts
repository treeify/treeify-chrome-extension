/**
 * 整数を表す型。
 * 実体は単なるnumber型なので整数であることを保証できないが、integer型の値は整数だと仮定していい。
 * （そう仮定して問題ないように注意深くコーディングする）
 */
export type integer = number

export type Coordinate = { x: integer; y: integer }
