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
}

type ShadowObject = any

/**
 * オブジェクトを書き換えること無く、書き換えたかのように見せかける仕組みを実現するクラス。
 * プロパティに対する操作を表すMutationというオブジェクトを記録しておき、
 * commit()が呼ばれたときに全てのMutationをオブジェクトに適用する。
 *
 * commit()を呼ぶ前にMutation適用後の値を取得するにはgetDerivedPropertyを使う。
 */
export class Batchizer {
  /**
   * 例えばitems[0]とitems["0"]は区別されるので、例えば"items.0"のような文字列ではパスを一意に表現できない。
   * そこで、PropertyPathを直接キーにできる辞書でList<Mutation>を管理する必要があると判断した。
   * Map<PropertyPath, List<Mutation>>ではPropertyPathオブジェクトの同値性の問題が厄介なので、
   * PropertyPathに対して一意に定まるオブジェクトと、そのオブジェクトに紐づくWeakMapを使うことにした。
   *
   */
  private shadowObject: ShadowObject = {}
  private mutationsWeakMap: WeakMap<ShadowObject, List<Mutation>> = new WeakMap()

  constructor(readonly state: any) {}

  private getMutations(propertyPath: PropertyPath) {
    const shadowProperty = Batchizer.getShadowProperty(propertyPath, this.shadowObject)
    return this.mutationsWeakMap.get(shadowProperty) ?? List.of()
  }

  private setMutations(propertyPath: PropertyPath, mutations: List<Mutation>) {
    const shadowProperty = Batchizer.getShadowProperty(propertyPath, this.shadowObject)
    this.mutationsWeakMap.set(shadowProperty, mutations)
  }

  private static getShadowProperty(
    propertyPath: PropertyPath,
    shadowObject: ShadowObject
  ): ShadowObject | undefined {
    const key = propertyPath.first(undefined)
    if (key === undefined) return shadowObject

    if (shadowObject[key] === undefined) {
      shadowObject[key] = {}
    }

    return this.getShadowProperty(propertyPath.shift(), shadowObject[key])
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

  /** 全てのMutationを適用し、stateを変更する */
  commit() {
    const propertyPaths = Batchizer.yieldPropertyPath(this.shadowObject, PropertyPath.of())
    for (const propertyPath of propertyPaths) {
      // TODO: ちょっとした最適化の余地あり（getMutationsが2回呼ばれる）
      if (!this.getMutations(propertyPath).isEmpty()) {
        this.setOriginalValue(propertyPath, this.getDerivedValue(propertyPath))
      }
    }

    this.clearPostedMutations()
  }

  /** 全ての未適用のMutationを破棄する */
  clearPostedMutations() {
    this.mutationsWeakMap = new WeakMap<ShadowObject, List<Mutation>>()
    this.shadowObject = {}
  }

  // ShadowObjectを探索し、全てのPropertyPathを返す
  private static *yieldPropertyPath(
    shadowObject: ShadowObject,
    prefix: PropertyPath
  ): Generator<PropertyPath> {
    for (const key of Object.keys(shadowObject)) {
      yield prefix.push(key)
      const shadowProperty = shadowObject[key]
      yield* this.yieldPropertyPath(shadowProperty, prefix.push(key))
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
