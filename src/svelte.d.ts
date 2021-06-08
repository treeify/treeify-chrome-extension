// .svelteファイルを.tsファイル内でimportするための型定義ファイル。
// 本来は@tsconfig/svelteパッケージを使うのが正解らしいのだが、
// 全然うまく行かなかったのでこの方法で対処した。
// 参考：https://qiita.com/oekazuma/items/387b856ac67ab05d71e9
// 参考：https://qiita.com/hisayuki/items/0ca740968ea34806efa3#sveltedts%E3%81%AE%E8%BF%BD%E5%8A%A0

declare module '*.svelte' {
  interface ComponentOptions<Props> {
    target: HTMLElement
    anchor?: HTMLElement
    props?: Props
    hydrate?: boolean
    intro?: boolean
  }

  interface Component<Props> {
    new (options: ComponentOptions<Props>): any
    $set: (props: {}) => any
    $on: (event: string, callback: (event: CustomEvent) => any) => any
    $destroy: () => any
    render: (props?: {}) => {
      html: string
      css: {code: string; map?: string}
      head?: string
    }
  }

  const component: Component<{}>

  export default component
}
