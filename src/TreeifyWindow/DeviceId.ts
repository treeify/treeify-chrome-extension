import {v4} from 'uuid'

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
        deviceId = v4()
        localStorage.setItem(deviceIdKey, deviceId)
      }
    }

    return deviceId
  }
}
