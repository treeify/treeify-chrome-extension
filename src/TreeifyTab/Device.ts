import {nanoid} from 'nanoid'
import {integer} from 'src/Common/integer'

/** ユーザーが複数のデバイスでTreeifyを使うことを想定した、デバイスを一意に識別するための値 */
export type DeviceId = string

/**
 * Device Internal Serial Numberの略。
 * このデバイスで生成されたアイテムの通し番号。
 * DeviceIdとDisnのペアをグローバルアイテムIDと呼ぶ。
 */
export type Disn = integer

export namespace Device {
  // Treeifyの設計ではInternalにもExternalにも属さないこのようなグローバル変数は存在してはいけないのだが、
  // デバイスIDは絶対に変更されない値なのでむしろこうしちゃった方が素直に扱える。
  let deviceId: DeviceId | undefined
  let maxDisn: Disn | undefined

  const DEVICE_ID_KEY = 'DEVICE_ID_KEY'
  const MAX_DISN_KEY = 'MAX_DISN_KEY'

  /**
   * このプログラムが実行されているデバイスのデバイスIDを返す。
   * 未生成の場合は生成する。
   */
  export function getId(): DeviceId {
    if (deviceId === undefined) {
      deviceId = localStorage.getItem(DEVICE_ID_KEY) ?? undefined
      if (deviceId === undefined) {
        // 7桁のNano IDを生成する。
        // データ容量にそれなりの影響を及ぼすので安全な範囲で桁数を絞ってある。
        // 仮に10億ユーザーが全員2デバイス間で同期したとしても衝突が起こらないよう桁数を選んだ。
        // 10億ユーザーが誰も衝突に遭遇せずに済む確率は、7桁なら99.9772%、6桁なら98.5553%となる。
        // 計算式：(1 - 1 / 64^7)^1000000000
        deviceId = nanoid(7)
        localStorage.setItem(DEVICE_ID_KEY, deviceId)
      }
    }

    return deviceId
  }

  export function generateDisn(): Disn {
    if (maxDisn === undefined) {
      const savedValue = localStorage.getItem(MAX_DISN_KEY)
      if (savedValue === null) {
        setMaxDisn(0)
        return 0
      } else {
        maxDisn = parseInt(savedValue)
      }
    }

    setMaxDisn(maxDisn + 1)
    return maxDisn + 1
  }

  function setMaxDisn(disn: Disn) {
    maxDisn = disn
    localStorage.setItem(MAX_DISN_KEY, disn.toString())
  }
}
