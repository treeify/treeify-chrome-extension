import {List} from 'immutable'

export type PropertyPath = List<keyof any>

export namespace PropertyPath {
  /** List.of<keyof any>(...)と書く代わりに使うべし */
  export function of(...args: (keyof any)[]) {
    return List.of(...args)
  }

  const delimiter = '/'

  export function toString(propertyPath: PropertyPath): string {
    return propertyPath.join(delimiter)
  }

  export function fromString(value: string): PropertyPath {
    return List(value.split(delimiter))
  }
}
