import { pipe } from 'fp-ts/function'
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
import { RSet$ } from 'src/Utility/fp-ts'
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

  // 次の描画が完了した際に実行される関数。フォーカスなどの設定に用いられる
  private pendingFocusAndTextSelectionSetting: (() => void) | undefined

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
    const chunks = pipe(
      this.mutatedPropertyPaths,
      RSet$.map(Chunk.convertToChunkId),
      RSet$.map((chunkId) => Chunk.create(Internal.instance.state, chunkId))
    )
    Database.writeChunks(Array.from(chunks))
    this.mutatedPropertyPaths.clear()

    // DOM更新完了後に実行される
    tick().then(() => {
      this.pendingFocusAndTextSelectionSetting?.()
      this.pendingFocusAndTextSelectionSetting = undefined
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
      if (CurrentState.getSelectedItemPaths().length === 1) {
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

  requestToFocusTargetItem(textItemSelection?: TextItemSelection | undefined) {
    this.pendingFocusAndTextSelectionSetting = () => {
      // フォーカスを設定する
      if (CurrentState.getSelectedItemPaths().length === 1) {
        const targetItemPath = CurrentState.getTargetItemPath()
        const targetElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
        const focusableElement = document.getElementById(targetElementId)
        focusableElement?.focus()
      } else {
        // 複数選択の場合
        focusMainAreaBackground()
      }

      if (textItemSelection !== undefined && document.activeElement !== null) {
        // キャレット位置、テキスト選択範囲を設定する
        setDomSelection(document.activeElement, textItemSelection)
      }
    }
  }

  requestToSetCaretPosition(position: integer) {
    this.pendingFocusAndTextSelectionSetting = () => {
      // フォーカスを設定する
      const targetItemPath = CurrentState.getTargetItemPath()
      const targetElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
      const focusableElement = document.getElementById(targetElementId)
      focusableElement?.focus()

      if (document.activeElement !== null) {
        // キャレット位置、テキスト選択範囲を設定する
        setDomSelection(document.activeElement, {
          focusDistance: position,
          anchorDistance: position,
        })
      }
    }
  }

  onMutateState(propertyPath: PropertyPath) {
    this.mutatedPropertyPaths.add(propertyPath)
  }
}
