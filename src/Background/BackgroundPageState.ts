import {integer, StableTab} from 'src/Common/basicType'

/** バックグラウンドページがオンメモリで管理する状態をまとめたシングルトンクラス */
export class BackgroundPageState {
  // シングルトンインスタンス
  private static _instance: BackgroundPageState

  // TODO: 永続化された値で初期化する
  nextNewStableTabId: integer = 1

  // StableTabの集まりに対するオンメモリインデックスの1つ
  readonly stableTabMapFromTabId = new Map<integer, StableTab>()

  private constructor() {}

  /** シングルトンインスタンスを取得する */
  static get instance(): BackgroundPageState {
    if (this._instance === undefined) {
      this._instance = new BackgroundPageState()
    }
    return this._instance
  }
}
