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
import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
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

  readonly mutatedStatePaths = new Set<StatePath>()

  // 次の描画が完了した際に実行される関数。フォーカスなどの設定に用いられる
  private pendingFocusAndTextSelectionSetting: (() => void) | undefined

  // 次の描画が完了した際に実行される関数。自動スクロールのために用いられる
  private pendingScroll: (() => void) | undefined

  /**
   * 画面を再描画すべきタイミングで更新イベントが起こるストアを返す。
   * タイミングを伝えるだけなので値に意味はない。
   */
  get rerenderingPulse(): Readable<{}> {
    return this.#rerenderingPulse
  }

  /** DOMを再描画する */
  rerender() {
    // 再描画によって勝手にスクロールされることがあるので、スクロール位置をリセットするために現在値を記録しておく
    const mainArea = document.querySelector<HTMLElement>('.main-area_root')
    assertNonNull(mainArea)
    const scrollTop = mainArea.scrollTop

    // Treeifyタブのタイトルを更新する
    document.title = CurrentState.deriveTreeifyTabTitle()

    this.#rerenderingPulse.set({})

    // IndexedDBを更新
    const chunks = pipe(
      this.mutatedStatePaths,
      RSet$.map(Chunk.convertToChunkId),
      RSet$.map((chunkId) => Chunk.create(Internal.instance.state, chunkId))
    )
    Database.writeChunks(Array.from(chunks))
    this.mutatedStatePaths.clear()

    // DOM更新完了後に実行される
    tick().then(() => {
      this.pendingFocusAndTextSelectionSetting?.()
      this.pendingFocusAndTextSelectionSetting = undefined

      // 項目を兄弟リスト内で下に移動した際に勝手にスクロールされる現象への対策。
      // スクロール位置を再描画の前後で維持する。
      mainArea.scrollTop = scrollTop

      this.pendingScroll?.()
      this.pendingScroll = undefined
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

    this.requestToFocusTargetItem()
    this.requestToScrollCenter()

    tick().then(() => {
      this.pendingFocusAndTextSelectionSetting?.()
      this.pendingFocusAndTextSelectionSetting = undefined

      this.pendingScroll?.()
      this.pendingScroll = undefined
    })
  }

  requestToFocusTargetItem(textItemSelection?: TextItemSelection | undefined) {
    this.pendingFocusAndTextSelectionSetting = () => {
      // フォーカスを設定する
      if (CurrentState.getSelectedItemPaths().length === 1) {
        const targetItemPath = CurrentState.getTargetItemPath()
        const targetElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
        const focusableElement = document.getElementById(targetElementId)
        focusableElement?.focus({ preventScroll: true })
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
      focusableElement?.focus({ preventScroll: true })

      if (document.activeElement !== null) {
        // キャレット位置、テキスト選択範囲を設定する
        setDomSelection(document.activeElement, {
          focusDistance: position,
          anchorDistance: position,
        })
      }
    }
  }

  /** ターゲット項目が画面中央に来るように次の描画後にスクロールする */
  requestToScrollCenter() {
    this.pendingScroll = () => {
      const targetItemPath = CurrentState.getTargetItemPath()
      const targetElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
      const targetElement = document.getElementById(targetElementId)
      if (targetElement === null) return

      targetElement.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      })
    }
  }

  /** ターゲット項目が画面外（下）の場合、画面下端付近に表示されるよう次の描画後にスクロールする */
  requestToScrollBelow() {
    this.pendingScroll = () => {
      const targetItemPath = CurrentState.getTargetItemPath()
      const targetElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
      const targetElement = document.getElementById(targetElementId)
      if (targetElement === null) return

      const mainArea = document.querySelector<HTMLElement>('.main-area_root')
      assertNonNull(mainArea)
      if (targetElement.getBoundingClientRect().bottom > mainArea.getBoundingClientRect().bottom) {
        targetElement.scrollIntoView({
          behavior: 'auto',
          block: 'end',
        })
      }
    }
  }

  /** ターゲット項目が画面外（上）の場合、画面上端付近に表示されるよう次の描画後にスクロールする */
  requestToScrollAbove() {
    this.pendingScroll = () => {
      const targetItemPath = CurrentState.getTargetItemPath()
      const targetElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
      const targetElement = document.getElementById(targetElementId)
      if (targetElement === null) return

      const mainArea = document.querySelector<HTMLElement>('.main-area_root')
      assertNonNull(mainArea)
      if (targetElement.getBoundingClientRect().top < mainArea.getBoundingClientRect().top) {
        targetElement.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        })
      }
    }
  }

  onMutateState(statePath: StatePath) {
    this.mutatedStatePaths.add(statePath)
  }
}
