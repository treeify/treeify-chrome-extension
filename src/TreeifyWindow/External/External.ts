import {integer, ItemId, TabId} from 'src/Common/basicType'
import {assert} from 'src/Common/Debug/assert'
import {List} from 'immutable'
import {render as renderWithLitHtml} from 'lit-html'
import {createRootViewModel, RootView} from 'src/TreeifyWindow/View/RootView'
import {setDomSelection, TextItemSelection} from 'src/TreeifyWindow/External/domTextSelection'
import {State} from 'src/TreeifyWindow/Internal/State'
import {TextItemDomElementCache} from 'src/TreeifyWindow/External/TextItemDomElementCache'
import {createFocusTrap} from 'focus-trap'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DataFolder} from 'src/TreeifyWindow/External/DataFolder'
import {Chunk} from 'src/TreeifyWindow/Internal/Chunk'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {TabItemCorrespondence} from 'src/TreeifyWindow/External/TabItemCorrespondence'

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

  /** データフォルダ */
  dataFolder: DataFolder | undefined

  /** ブラウザのタブとTreeifyのウェブページアイテムを紐付けるためのオブジェクト */
  readonly tabItemCorrespondence = new TabItemCorrespondence()

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
    this.tabItemCorrespondence.tieTabAndItem(tabId, itemId)
  }

  /** タブIDとアイテムIDの結びつけを解除する */
  untieTabAndItemByTabId(tabId: TabId) {
    this.tabItemCorrespondence.untieTabAndItemByTabId(tabId)
  }

  /** DOMの初回描画を行う */
  render(state: State) {
    const spaRoot = document.getElementById('spa-root')!
    renderWithLitHtml(RootView(createRootViewModel(state)), spaRoot)

    // Treeifyウィンドウのタイトルを更新する
    document.title = CurrentState.deriveTreeifyWindowTitle(state)
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

    if (this.pendingTextItemSelection !== undefined && document.activeElement !== null) {
      // キャレット位置、テキスト選択範囲を設定する
      setDomSelection(document.activeElement, this.pendingTextItemSelection)
    }

    this.pendingFocusElementId = undefined
    this.pendingTextItemSelection = undefined

    // ウェブページアイテムのタイトル設定ダイアログが表示中ならフォーカストラップを作る
    const webPageItemTitleSettingDialog = document.getElementById(
      'web-page-item-title-setting-dialog'
    )
    if (webPageItemTitleSettingDialog !== null) {
      const focusTrap = createFocusTrap(webPageItemTitleSettingDialog, {
        clickOutsideDeactivates: true,
        returnFocusOnDeactivate: true,
        onDeactivate: () => {
          CurrentState.setWebPageItemTitleSettingDialog(null)
          CurrentState.commit()
        },
      })
      focusTrap.activate()
    }

    // Treeifyウィンドウのタイトルを更新する
    document.title = CurrentState.deriveTreeifyWindowTitle(newState)
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
   * データフォルダへの書き込みを行う。
   */
  requestWriteDataFolder(newState: State, mutatedPropertyPaths: Set<PropertyPath>) {
    if (this.dataFolder === undefined) return

    // 変化のあったチャンクをデータベースに書き込む
    for (const chunkId of Chunk.extractChunkIds(mutatedPropertyPaths)) {
      const chunk = Chunk.create(newState, chunkId)
      if (chunk !== undefined) {
        this.dataFolder.writeChunk(chunk)
      } else {
        this.dataFolder.deleteFile(chunkId)
      }
    }
  }
}
