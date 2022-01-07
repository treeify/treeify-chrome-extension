/** 高階関数の型の略記用 */
export type Arrow<A, B> = (value: A) => B

export function call<T>(f: () => T): T {
  return f()
}
