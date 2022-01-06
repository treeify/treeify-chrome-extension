export type Rist<T> = readonly T[]

export namespace Rist {
  export function push<T>(array: Rist<T>, value: T): T[] {
    return [...array, value]
  }
}
