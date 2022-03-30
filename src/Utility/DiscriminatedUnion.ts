/**
 * タグ付きUnion型を定義するためのユーティリティ。
 * 再帰的な構造を持つ代数的データ型は定義できない。
 * @example
 * DiscriminatedUnion<{ Rect: { width: number; height: number }; Circle: { radius: number } }>
 * ↑と↓は等価
 * { type: 'Rect'; width: number; height: number } | { type: 'Circle'; radius: number }
 */
export type DiscriminatedUnion<T, K extends keyof T = keyof T> = K extends K
  ? { type: K } & T[K]
  : never
