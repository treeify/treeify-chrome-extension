import { nanoid } from 'nanoid'
import PowerRadix from 'power-radix'
import { integer } from 'src/Common/integer'

/**
 * 複数デバイスでデータを同期する際にデバイスを一意に識別するために導入した概念。
 * 実際にはデバイス単位ではなく、Treeifyのインストールごとに生成されるのでDeviceIdではなくInstanceIdと命名した。
 */
export type InstanceId = string

/**
 * Instance Internal Serial Numberの略。
 * このインスタンスで生成された項目の通し番号。
 */
export type Iisn = integer

/**
 * 分散環境で発行しても衝突しないよう設計された特殊な項目ID。
 * 該当項目を生成したインスタンスのIDと、そのインスタンスで生成された項目の通し番号(iisn)のペアからなる。
 * 具体的には下記のフォーマットの文字列として表現される。
 * `${instanceId}#${base62(iisn)}`
 * base62は62進数への変換関数を表す。
 * この62進数の文字の種類は[0-9][A-Z][a-z]であり数値、大文字、小文字の順に値が大きくなる。
 *
 * なおトップページのみ特別に'Treeify#0'という固有のグローバル項目IDを持つ。
 */
export type GlobalItemId = string

export namespace GlobalItemId {
  export function generate(): GlobalItemId {
    const radix62 = new PowerRadix(Instance.generateIisn(), 10).toString(62)
    return `${Instance.getId()}#${radix62}`
  }
}

export namespace Instance {
  // Treeifyの設計ではInternalにもExternalにも属さないこのようなグローバル変数は基本的に存在すべきでないのだが、
  // インスタンスIDは絶対に変更されない値なのでむしろこうしちゃった方が素直に扱える。
  let instanceId: InstanceId | undefined
  let maxIisn: Iisn | undefined

  const INSTANCE_ID_KEY = 'INSTANCE_ID_KEY'
  const MAX_IISN_KEY = 'MAX_IISN_KEY'

  /**
   * このプログラムが実行されているインスタンスのIDを返す。
   * 未生成の場合は生成する。
   */
  export function getId(): InstanceId {
    if (instanceId === undefined) {
      instanceId = localStorage.getItem(INSTANCE_ID_KEY) ?? undefined
      if (instanceId === undefined) {
        // 7桁のNano IDを生成する。
        // 桁数が多すぎるとデータフォルダなどの容量にそれなりの影響を及ぼすので安全な範囲で桁数を絞ってある。
        // 仮に10億ユーザーが全員2インスタンス間で同期したとしても衝突が起こらないよう桁数を選んだ。
        // 10億ユーザーが誰も衝突に遭遇せずに済む確率は、7桁なら99.9772%、6桁なら98.5553%となる。
        // 計算式：(1 - 1 / 64^7)^1000000000
        instanceId = nanoid(7)
        localStorage.setItem(INSTANCE_ID_KEY, instanceId)
      }
    }

    return instanceId
  }

  export function generateIisn(): Iisn {
    if (maxIisn === undefined) {
      const savedValue = localStorage.getItem(MAX_IISN_KEY)
      if (savedValue === null) {
        setMaxIisn(0)
        return 0
      } else {
        maxIisn = parseInt(savedValue)
      }
    }

    setMaxIisn(maxIisn + 1)
    return maxIisn + 1
  }

  function setMaxIisn(iisn: Iisn) {
    maxIisn = iisn
    localStorage.setItem(MAX_IISN_KEY, iisn.toString())
  }
}
