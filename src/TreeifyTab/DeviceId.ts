import {nanoid} from 'nanoid'

/** ユーザーが複数のデバイスでTreeifyを使うことを想定した、デバイスを一意に識別するための値 */
export type DeviceId = string

export namespace DeviceId {
  // Treeifyの設計ではInternalにもExternalにも属さないこのようなグローバル変数は存在してはいけないのだが、
  // デバイスIDは絶対に変更されない値なのでむしろこうしちゃった方が素直に扱える。
  let deviceId: DeviceId | undefined

  const deviceIdKey = 'deviceId'

  /**
   * このプログラムが実行されているデバイスのデバイスIDを返す。
   * 未生成の場合は生成する。
   */
  export function get(): DeviceId {
    if (deviceId === undefined) {
      deviceId = localStorage.getItem(deviceIdKey) ?? undefined
      if (deviceId === undefined) {
        // 7桁のNano IDを生成する。
        // データ容量にそれなりの影響を及ぼすので安全な範囲で桁数を絞ってある。
        // 仮に10億ユーザーが全員2デバイス間で同期したとしても衝突が起こらないよう桁数を選んだ。
        // 10億ユーザーが誰も衝突に遭遇せずに済む確率は、7桁なら99.9772%、6桁なら98.5553%となる。
        // 計算式：(1 - 1 / 64^7)^1000000000
        deviceId = nanoid(7)
        localStorage.setItem(deviceIdKey, deviceId)
      }
    }

    return deviceId
  }
}
