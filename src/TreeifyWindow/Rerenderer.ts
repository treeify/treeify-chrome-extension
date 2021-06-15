import {integer} from 'src/Common/integer'
import {
  focusItemTreeBackground,
  setDomSelection,
  TextItemSelection,
} from 'src/TreeifyWindow/External/domTextSelection'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentView'
import {tick} from 'svelte'
import {Readable, writable} from 'svelte/store'

/**
 * 画面の再描画に関する制御を担当するクラス。
 * 実際のDOM書き換え処理はSvelteが行うので、あくまで制御だけ。
 */
export class Rerenderer {
  private static _instance: Rerenderer | undefined

  static get instance(): Rerenderer {
    if (this._instance === undefined) {
      this._instance = new Rerenderer()
    }
    return this._instance
  }

  // 再描画制御変数。
  // 画面の再描画の唯一のトリガーとして運用するストア。
  // 値の内容に意味はないが、プリミティブ値だと更新イベントが起きないので{}にした。
  readonly #rerenderingPulse = writable({})

  // 次の描画が完了した際に設定すべきテキスト選択範囲
  private pendingTextItemSelection: TextItemSelection | undefined

  /**
   * 画面を再描画すべきタイミングで更新イベントが起こるストアを返す。
   * タイミングを伝えるだけなので値に意味はない。
   */
  get rerenderingPulse(): Readable<{}> {
    return this.#rerenderingPulse
  }

  /** 再描画を実行する */
  rerender() {
    // Treeifyウィンドウのタイトルを更新する
    document.title = CurrentState.deriveTreeifyWindowTitle()

    this.#rerenderingPulse.set({})

    // DOM更新完了後に実行される
    tick().then(() => {
      // アイテムツリーのスクロール位置を復元
      const itemTree = document.querySelector('.item-tree')
      const scrollPosition = External.instance.scrollPositions.get(CurrentState.getActivePageId())
      if (scrollPosition !== undefined && itemTree instanceof HTMLElement) {
        itemTree.scrollTop = scrollPosition
      }

      // フォーカスを設定する
      if (CurrentState.getSelectedItemPaths().size === 1) {
        const targetItemPath = CurrentState.getTargetItemPath()
        const targetElementId = ItemTreeContentView.focusableDomElementId(targetItemPath)
        const focusableElement = document.getElementById(targetElementId)
        focusableElement?.focus()
      } else {
        // 複数選択の場合
        focusItemTreeBackground()
      }

      if (this.pendingTextItemSelection !== undefined && document.activeElement !== null) {
        // キャレット位置、テキスト選択範囲を設定する
        setDomSelection(document.activeElement, this.pendingTextItemSelection)
      }

      this.pendingTextItemSelection = undefined
    })
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
}
