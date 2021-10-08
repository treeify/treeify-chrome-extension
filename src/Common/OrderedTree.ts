export class MutableOrderedTree<T> {
  constructor(public value: T, public children: MutableOrderedTree<T>[] = []) {}

  /** いわゆるcatamorphism */
  fold<U>(f: (value: T, foldedChildren: U[]) => U): U {
    return f(
      this.value,
      this.children.map((child) => child.fold(f))
    )
  }
}
