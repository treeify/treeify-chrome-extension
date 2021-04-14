import {createFocusTrap} from 'focus-trap'
import {List} from 'immutable'
import {render as renderWithLitHtml} from 'lit-html'
import md5 from 'md5'
import {assertNonNull} from 'src/Common/Debug/assert'
import {integer} from 'src/Common/integer'
import {ItemId} from 'src/TreeifyWindow/basicType'
import {DataFolder} from 'src/TreeifyWindow/External/DataFolder'
import {setDomSelection, TextItemSelection} from 'src/TreeifyWindow/External/domTextSelection'
import {TabItemCorrespondence} from 'src/TreeifyWindow/External/TabItemCorrespondence'
import {TextItemDomElementCache} from 'src/TreeifyWindow/External/TextItemDomElementCache'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {generateStyleElementContents} from 'src/TreeifyWindow/View/css'
import {createRootViewModel, RootView} from 'src/TreeifyWindow/View/RootView'

/** TODO: コメント */
export class External {
  private static _instance: External | undefined

  /** データフォルダ */
  dataFolder: DataFolder | undefined
  // データフォルダに書き込むべきプロパティパス
  readonly pendingMutatedPropertyPaths = new Set<PropertyPath>()

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
    renderWithLitHtml(generateStyleElementContents(), styleElement)

    const spaRoot = document.querySelector('.spa-root')
    assertNonNull(spaRoot)
    renderWithLitHtml(RootView(createRootViewModel(state)), spaRoot)

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
    const webPageItemTitleSettingDialog = document.querySelector<HTMLElement>(
      '.web-page-item-title-setting-dialog'
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
    document.title = CurrentState.deriveTreeifyWindowTitle(state)
  }

  /** 次の描画が完了した際にフォーカスしてほしいDOM要素のIDを指定する */
  requestFocusAfterRendering(elementId: string) {
    this.pendingFocusElementId = elementId
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
      this.pendingMutatedPropertyPaths.add(mutatedPropertyPath)
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
