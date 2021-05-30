import {List} from 'immutable'
import md5 from 'md5'
import {assertNonNull} from 'src/Common/Debug/assert'
import {doWithTimeMeasuring} from 'src/Common/Debug/logger'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {DataFolder} from 'src/TreeifyWindow/External/DataFolder'
import {
  focusItemTreeBackground,
  setDomSelection,
  TextItemSelection,
} from 'src/TreeifyWindow/External/domTextSelection'
import {TabItemCorrespondence} from 'src/TreeifyWindow/External/TabItemCorrespondence'
import {TextItemDomElementCache} from 'src/TreeifyWindow/External/TextItemDomElementCache'
import {Chunk, ChunkId} from 'src/TreeifyWindow/Internal/Chunk'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {generateStyleElementContents} from 'src/TreeifyWindow/View/css'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {createRootViewModel, RootView} from 'src/TreeifyWindow/View/RootView'

/** TODO: コメント */
export class External {
  private static _instance: External | undefined

  /** データフォルダ */
  dataFolder: DataFolder | undefined
  /** データフォルダに書き込むべきChunkId群 */
  readonly pendingMutatedChunkIds = new Set<ChunkId>()

  /** フローティング型の左サイドバーを表示するべきかどうか */
  shouldFloatingLeftSidebarShown: boolean = false

  /** ブラウザのタブとTreeifyのウェブページアイテムを紐付けるためのオブジェクト */
  readonly tabItemCorrespondence = new TabItemCorrespondence()

  lastFocusedWindowId: integer = undefined as any

  /** 既存のウェブページアイテムに対応するタブを開いた際、タブ作成イベントリスナーでアイテムIDと紐付けるためのMap */
  readonly urlToItemIdsForTabCreation = new Map<string, List<ItemId>>()

  /** 独自クリップボード */
  treeifyClipboard: TreeifyClipboard | undefined

  /**
   * テキストアイテムのcontenteditableな要素のキャッシュ。
   * TODO: キャッシュする理由を探す。見つからなければ廃止を検討する。
   *  このキャッシュはlit-htmlを使っていた時代に必要だったもの。現在も必要なのかどうか把握していない。
   */
  readonly textItemDomElementCache = new TextItemDomElementCache()

  // 次の描画が完了した際に設定すべきテキスト選択範囲
  private pendingTextItemSelection: TextItemSelection | undefined

  /**
   * ハードアンロードによってタブを閉じられる途中のタブIDの集合。
   * chrome.tabs.onRemovedイベント時に、タブがアンロード由来で閉じられたのかを判定するために用いる。
   */
  readonly hardUnloadedTabIds = new Set<integer>()

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

  /** DOMの初回描画を行う */
  render(state: State) {
    const styleElement = document.querySelector('.style')
    assertNonNull(styleElement)
    const result = doWithTimeMeasuring('generateStyleElementContents', () =>
      generateStyleElementContents()
    )
    doWithTimeMeasuring('styleElement.innerHTML = result', () => {
      styleElement.innerHTML = result
    })

    const spaRoot = document.querySelector('.spa-root')
    assertNonNull(spaRoot)
    const result1 = doWithTimeMeasuring('RootView(createRootViewModel(state))', () =>
      RootView(createRootViewModel(state))
    )

    doWithTimeMeasuring('spaRootの子要素取り替え', () => {
      spaRoot.innerHTML = ''
      spaRoot.appendChild(result1)
    })

    doWithTimeMeasuring('フォーカスとキャレットの更新', () => {
      if (CurrentState.getSelectedItemPaths().size === 1) {
        const targetItemPath = CurrentState.getTargetItemPath()
        const targetElementId = ItemTreeContentView.focusableDomElementId(targetItemPath)
        const focusableElement = document.getElementById(targetElementId)
        if (focusableElement !== null) {
          // フォーカスアイテムが画面内に入るようスクロールする。
          // blockに'center'を指定してもなぜか中央化してくれない（原因不明）。
          focusableElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          })

          focusableElement.focus()
        }
      } else {
        // 複数選択の場合
        focusItemTreeBackground()
      }

      if (this.pendingTextItemSelection !== undefined && document.activeElement !== null) {
        // キャレット位置、テキスト選択範囲を設定する
        setDomSelection(document.activeElement, this.pendingTextItemSelection)
      }
    })

    this.pendingTextItemSelection = undefined

    // Treeifyウィンドウのタイトルを更新する
    document.title = CurrentState.deriveTreeifyWindowTitle()
  }

  /**
   * 次の描画が完了した際に設定してほしいテキスト選択範囲を指定する。
   * undefinedを指定されても何もしない。
   */
  requestSelectAfterRendering(textItemSelection: TextItemSelection | undefined) {
    this.pendingTextItemSelection = textItemSelection
  }

  /** 次の描画が完了した際に設定してほしいテキスト選択範囲を指定する */
  requestSetCaretDistanceAfterRendering(distance: integer) {
    this.requestSelectAfterRendering({focusDistance: distance, anchorDistance: distance})
  }

  /** データフォルダへの差分書き込みの対象箇所を伝える */
  postMutatedPropertyPaths(newState: State, mutatedPropertyPaths: Set<PropertyPath>) {
    if (this.dataFolder === undefined) return

    for (const mutatedPropertyPath of mutatedPropertyPaths) {
      this.pendingMutatedChunkIds.add(Chunk.convertToChunkId(mutatedPropertyPath))
    }
  }

  getTreeifyClipboardHash(): string | undefined {
    if (this.treeifyClipboard === undefined) return undefined

    const jsonString = JSON.stringify(this.treeifyClipboard, State.jsonReplacer)
    return md5(jsonString)
  }

  dumpCurrentState() {
    this.tabItemCorrespondence.dumpCurrentState()
  }
}

type TreeifyClipboard = {
  selectedItemPaths: List<ItemPath>
}
