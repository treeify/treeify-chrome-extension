import {List} from 'immutable'

/**
 * データの操作やその差分を表現するクラスのインターフェース。
 * 将来的にはundoメソッドを追加し、Undo機能を実装する予定。
 */
export interface Mutation {
  do: (oldValue: any) => any
}

/** データの操作やその差分を表現するクラスをまとめるための名前空間 */
export namespace Mutation {
  /** 指定された値で上書きするMutation */
  export class Set implements Mutation {
    constructor(private value: any) {}

    do(oldValue: any) {
      return this.value
    }
  }
}

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

/**
 * オブジェクトを書き換えること無く、書き換えたかのように見せかける仕組みを実現するクラス。
 * プロパティに対する操作を表すMutationというオブジェクトを記録しておき、
 * commit()が呼ばれたときに全てのMutationをオブジェクトに適用する。
 *
 * commit()を呼ぶ前にMutation適用後の値を取得するにはgetDerivedPropertyを使う。
 */
export class Batchizer {
  private mutationsMap: Map<string, List<Mutation>> = new Map()

  constructor(readonly state: any) {}

  private getMutations(propertyPath: PropertyPath): List<Mutation> {
    return this.mutationsMap.get(PropertyPath.toString(propertyPath)) ?? List.of()
  }

  private setMutations(propertyPath: PropertyPath, mutations: List<Mutation>) {
    this.mutationsMap.set(PropertyPath.toString(propertyPath), mutations)
  }

  /** 指定されたプロパティへのMutationを追加する */
  postMutation(propertyPath: PropertyPath, mutation: Mutation) {
    this.setMutations(propertyPath, this.getMutations(propertyPath).push(mutation))
  }

  /** Mutation.Setを作成・追加するユーティリティメソッド */
  postSetMutation(propertyPath: PropertyPath, value: any) {
    this.postMutation(propertyPath, new Mutation.Set(value))
  }

  /** 指定されたプロパティを削除する */
  deleteProperty(propertyPath: PropertyPath) {
    this.postSetMutation(propertyPath, undefined)
  }

  /**
   * 全てのMutationを適用し、stateを変更する。
   * Mutationを適用した全てのプロパティパスの集合を返す。
   */
  commit(): Set<PropertyPath> {
    const mutatedPropertyPaths = new Set<PropertyPath>()
    const propertyPaths = this.getAllPropertyPaths()
    for (const propertyPath of propertyPaths) {
      // TODO: ちょっとした最適化の余地あり（getMutationsが2回呼ばれる）
      if (!this.getMutations(propertyPath).isEmpty()) {
        this.setOriginalValue(propertyPath, this.getDerivedValue(propertyPath))
        mutatedPropertyPaths.add(propertyPath)
      }
    }

    this.clearPostedMutations()
    return mutatedPropertyPaths
  }

  /** 全ての未適用のMutationを破棄する */
  clearPostedMutations() {
    this.mutationsMap = new Map()
  }

  *getAllPropertyPaths(): Generator<PropertyPath> {
    for (const key of this.mutationsMap.keys()) {
      yield PropertyPath.fromString(key)
    }
  }

  /**
   * 指定されたプロパティのMutation適用結果を返す。
   * スーパープロパティに対するMutationも加味する。
   * スーパープロパティとは例えばa.b.cに対してa.bやaのことを指す。
   * これは例えばitems[42]プロパティに{}をsetし、items[42].isFoldedにtrueをsetするようなケースへの対策である。
   */
  getDerivedValue(propertyPath: PropertyPath): any {
    if (propertyPath.size === 0) return this.state

    const superProperty = this.getDerivedValue(propertyPath.pop())

    // オブジェクト以外のプロパティを取得しようとしているときはundefinedを返す
    if (typeof superProperty !== 'object') return undefined
    if (superProperty === null) return undefined

    const key: keyof any = propertyPath.last(undefined)!
    const originalValue = superProperty[key]
    const mutations = this.getMutations(propertyPath)
    return Batchizer.applyMutations(mutations, originalValue)
  }

  // 与えられた値にMutationを適用した値を返す
  private static applyMutations(mutations: List<Mutation>, originalValue: any): any {
    const lastMutation = mutations.last(undefined)
    if (lastMutation === undefined) {
      return originalValue
    } else {
      return lastMutation.do(this.applyMutations(mutations.pop(), originalValue))
    }
  }

  getOriginalValue(propertyPath: PropertyPath): any {
    return Batchizer.getOriginalProperty(propertyPath, this.state)
  }

  private setOriginalValue(propertyPath: PropertyPath, value: any) {
    Batchizer.setOriginalProperty(propertyPath, this.state, value)
  }

  private static getOriginalProperty(propertyPath: PropertyPath, state: any): any {
    // 再帰呼び出しの終端ケース。stateにはプロパティ値が入っているはずなのでそれを返す。
    const key = propertyPath.first(undefined)
    if (key === undefined) return state

    if (state instanceof Object) {
      return this.getOriginalProperty(propertyPath.shift(), state[key])
    } else {
      return undefined
    }
  }

  private static setOriginalProperty(propertyPath: PropertyPath, state: any, value: any) {
    if (typeof state !== 'object') return
    if (state === null) return

    const key = propertyPath.first(undefined)
    if (key === undefined) return state

    if (propertyPath.size === 1) {
      state[key] = value
    } else {
      this.setOriginalProperty(propertyPath.shift(), state[key], value)
    }
  }
}
