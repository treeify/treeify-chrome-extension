import { List } from 'immutable'
import {
  focusMainAreaBackground,
  setDomSelection,
  TextItemSelection,
} from 'src/TreeifyTab/External/domTextSelection'
import { Chunk } from 'src/TreeifyTab/Internal/Chunk'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Database } from 'src/TreeifyTab/Internal/Database'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import Root from 'src/TreeifyTab/View/Root.svelte'
import { assertNonNull } from 'src/Utility/Debug/assert'
import { integer } from 'src/Utility/integer'
import { tick } from 'svelte'
import { Readable, writable } from 'svelte/store'

/**
 * 画面の再描画に関する制御を担当するクラス。
 * 実際のDOM書き換え処理はSvelteが行うので、あくまで制御だけ。
 */
export class Rerenderer {
  static #instance: Rerenderer | undefined

  static get instance(): Rerenderer {
    if (this.#instance === undefined) {
      this.#instance = new Rerenderer()
    }
    return this.#instance
  }

  // 再描画制御変数。
  // 画面の再描画の唯一のトリガーとして運用するストア。
  // 値の内容に意味はないが、プリミティブ値だと更新イベントが起きないので{}にした。
  readonly #rerenderingPulse = writable({})

  readonly mutatedPropertyPaths = new Set<PropertyPath>()

  // 次の描画が完了した際に設定すべきテキスト選択範囲
  private pendingTextItemSelection: TextItemSelection | undefined

  /**
   * 画面を再描画すべきタイミングで更新イベントが起こるストアを返す。
   * タイミングを伝えるだけなので値に意味はない。
   */
  get rerenderingPulse(): Readable<{}> {
    return this.#rerenderingPulse
  }

  /** DOMを再描画する */
  rerender() {
    // Treeifyタブのタイトルを更新する
    document.title = CurrentState.deriveTreeifyTabTitle()

    this.#rerenderingPulse.set({})

    // IndexedDBを更新
    const chunks = List(this.mutatedPropertyPaths)
      .map((propertyPath) => Chunk.convertToChunkId(propertyPath))
      .toSet()
      .map((chunkId) => Chunk.create(Internal.instance.state, chunkId))
    Database.writeChunks(chunks.toList())
    this.mutatedPropertyPaths.clear()

    // DOM更新完了後に実行される
    tick().then(() => {
      // フォーカスを設定する
      if (CurrentState.getSelectedItemPaths().size === 1) {
        const targetItemPath = CurrentState.getTargetItemPath()
        const targetElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
        const focusableElement = document.getElementById(targetElementId)
        focusableElement?.focus()
      } else {
        // 複数選択の場合
        focusMainAreaBackground()
      }

      if (this.pendingTextItemSelection !== undefined && document.activeElement !== null) {
        // キャレット位置、テキスト選択範囲を設定する
        setDomSelection(document.activeElement, this.pendingTextItemSelection)
      }

      this.pendingTextItemSelection = undefined
    })
  }

  /** DOMの初回描画を行う */
  renderForFirstTime() {
    // Treeifyタブのタイトルを更新する
    document.title = CurrentState.deriveTreeifyTabTitle()

    const spaRoot = document.querySelector('#spa-root')
    assertNonNull(spaRoot)
    if (spaRoot instanceof HTMLElement) {
      new Root({
        target: spaRoot,
      })
    }

    // DOM更新完了後に実行される
    tick().then(() => {
      // フォーカスを設定する
      if (CurrentState.getSelectedItemPaths().size === 1) {
        const targetItemPath = CurrentState.getTargetItemPath()
        const targetElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
        const focusableElement = document.getElementById(targetElementId)
        focusableElement?.focus()
      } else {
        // 複数選択の場合
        focusMainAreaBackground()
      }
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
    this.requestSelectAfterRendering({ focusDistance: distance, anchorDistance: distance })
  }

  onMutateState(propertyPath: PropertyPath) {
    this.mutatedPropertyPaths.add(propertyPath)
  }
}
