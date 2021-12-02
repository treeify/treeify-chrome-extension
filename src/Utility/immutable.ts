import { List } from 'immutable'

export function join<T>(list: List<T>, delimiter: T): List<T> {
  const result: T[] = []
  for (let i = 0; i < list.size; i++) {
    result.push(list.get(i)!)
    if (i !== list.size - 1) {
      result.push(delimiter)
    }
  }
  return List(result)
}
