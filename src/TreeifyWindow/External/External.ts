import {integer, ItemId, TabId} from 'src/Common/basicType'
import {assert, assertNonUndefined} from 'src/Common/Debug/assert'
import {List} from 'immutable'
import {render as renderWithLitHtml} from 'lit-html'
import {createRootViewModel, RootView} from 'src/TreeifyWindow/View/RootView'
import {setDomSelection} from 'src/TreeifyWindow/External/domTextSelection'
import {State, TextItemSelection} from 'src/TreeifyWindow/Internal/State'
import {TextItemDomElementCache} from 'src/TreeifyWindow/External/TextItemDomElementCache'
import Tab = chrome.tabs.Tab

/** TODO: コメント */
export class External {
  private static _instance: External | undefined

  private constructor() {}

  /** シングルトンインスタンスを取得する */
  static get instance(): External {
    if (this._instance === undefined) {
      this._instance = new External()
    }
    return this._instance
  }

  /** シングルトンインスタンスを破棄する */
  static cleanup() {
    this._instance = undefined
  }

  /** データベースファイル */
  databaseFileHandle: FileSystemFileHandle | undefined
  // データベースファイルの書き込み頻度を抑えるための制御変数
  private isDatabaseFileWritingReserved: boolean = false

  /** タブIDからアイテムIDへのMap */
  readonly tabIdToItemId = new Map<TabId, ItemId>()
  /** アイテムIDからタブIDへのMap */
  readonly itemIdToTabId = new Map<ItemId, TabId>()
  /** タブIDからTabオブジェクトへのMap */
  readonly tabIdToTab = new Map<TabId, Tab>()

  /** 既存のウェブページアイテムに対応するタブを開いた際、タブ作成イベントリスナーでアイテムIDと紐付けるためのMap */
  readonly urlToItemIdsForTabCreation = new Map<string, List<ItemId>>()

  /**
   * テキストアイテムのcontenteditableな要素のキャッシュ。
   * 【キャッシュする理由】
   * contenteditableな要素はlit-htmlで描画するのが事実上困難なので、自前でDOM要素を生成している。
   * 参考：https://github.com/Polymer/lit-html/issues/572
   * キャッシュしないと画面更新ごとに全てのcontenteditableな要素が再生成されることになり、
   * パフォーマンスへの悪影響に加えてfocusとselectionが失われる問題に対処しなければならない。
   */
  readonly textItemDomElementCache = new TextItemDomElementCache()

  // 次の描画が完了した際にフォーカスすべきDOM要素のID
  private pendingFocusElementId: string | undefined

  // 次の描画が完了した際に設定すべきテキスト選択範囲
  private pendingTextItemSelection: TextItemSelection | undefined

  /**
   * ハードアンロードによってタブを閉じられる途中のタブIDの集合。
   * chrome.tabs.onRemovedイベント時に、タブがアンロード由来で閉じられたのかを判定するために用いる。
   */
  readonly hardUnloadedTabIds = new Set<integer>()

  /** タブIDとアイテムIDを結びつける */
  tieTabAndItem(tabId: TabId, itemId: ItemId) {
    this.tabIdToItemId.set(tabId, itemId)
    this.itemIdToTabId.set(itemId, tabId)
  }

  /** タブIDとアイテムIDの結びつけを解除する */
  untieTabAndItemByTabId(tabId: TabId) {
    const itemId = this.tabIdToItemId.get(tabId)
    assertNonUndefined(itemId)
    this.itemIdToTabId.delete(itemId)
    this.tabIdToItemId.delete(tabId)
  }

  /** DOMの初回描画を行う */
  render(state: State) {
    const spaRoot = document.getElementById('spa-root')!
    renderWithLitHtml(RootView(createRootViewModel(state)), spaRoot)
  }

  /** DOMを再描画する */
  rerender(newState: State) {
    const spaRoot = document.getElementById('spa-root')!

    renderWithLitHtml(RootView(createRootViewModel(newState)), spaRoot)

    if (this.pendingFocusElementId !== undefined) {
      const focusableElement = document.getElementById(this.pendingFocusElementId)
      if (focusableElement !== null) {
        // フォーカスアイテムが画面内に入るようスクロールする。
        // blockに'center'を指定してもなぜか中央化してくれない（原因不明）。
        focusableElement.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})

        focusableElement.focus()
      }
    }

    if (this.pendingTextItemSelection !== undefined) {
      // キャレット位置、テキスト選択範囲を設定する
      setDomSelection(document.activeElement!!, this.pendingTextItemSelection)
    }

    this.pendingFocusElementId = undefined
    this.pendingTextItemSelection = undefined
  }

  /** 次の描画が完了した際にフォーカスしてほしいDOM要素のIDを指定する */
  requestFocusAfterRendering(elementId: string) {
    // 1回の描画サイクル内で2回以上設定されたらエラーにするためのassert文。
    // 別に2回設定されても困るわけではないと思うが、考慮漏れや設計破綻を早期発見するためにとりあえずassertしておく。
    assert(this.pendingFocusElementId === undefined)

    this.pendingFocusElementId = elementId
  }

  /**
   * 次の描画が完了した際に設定してほしいテキスト選択範囲を指定する。
   * undefinedを指定されても何もしない。
   */
  requestSelectAfterRendering(textItemSelection: TextItemSelection | undefined) {
    // 1回の描画サイクル内で2回以上設定されたらエラーにするためのassert文。
    // 別に2回設定されても困るわけではないと思うが、考慮漏れや設計破綻を早期発見するためにとりあえずassertしておく。
    assert(this.pendingTextItemSelection === undefined)

    this.pendingTextItemSelection = textItemSelection
  }

  /** 次の描画が完了した際に設定してほしいテキスト選択範囲を指定する */
  requestSetCaretDistanceAfterRendering(distance: integer) {
    this.requestSelectAfterRendering({focusDistance: distance, anchorDistance: distance})
  }

  /**
   * データベースファイルへの上書きを行う。
   * State変化のたびに書き込んでいるとSSDの寿命を縮める可能性があるので、ある程度の時間間隔をおいて書き込む。
   * TODO: databaseFileHandleがundefinedのときでも内部機構が動いてしまっている
   *
   * 【書き込み量の試算】
   * データベースファイルが1MBだとする（ヘビーユーザーならこれくらいは余裕で超えてくるはず）。
   * 1分間あたり平均30回書き込むとする。
   * ↓
   * 10時間で1万8千回書き込むことになり、合計書き込み量は18GBとなる。
   * ファイルまるごと上書きする方式ではどうしても負荷はかかる。
   */
  requestOverwriteDatabaseFile(newState: State) {
    // 前回の書き込みリクエストから一定時間経っていなければ何もしない
    if (this.isDatabaseFileWritingReserved) return

    // 一定時間のディレイ後にデータベースファイルに書き込む
    this.isDatabaseFileWritingReserved = true
    setTimeout(async () => {
      this.isDatabaseFileWritingReserved = false
      const stream = await this.databaseFileHandle?.createWritable()
      await stream?.write(State.toJsonString(newState))
      await stream?.close()
    }, 1000)
    // TODO: ↑ディレイの長さは設定可能であるべきでは？
  }
}
