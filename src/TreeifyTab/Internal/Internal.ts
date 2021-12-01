import { List } from 'immutable'
import { ItemType } from 'src/TreeifyTab/basicType'
import { External } from 'src/TreeifyTab/External/External'
import { Chunk, ChunkId } from 'src/TreeifyTab/Internal/Chunk'
import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
import { SearchEngine } from 'src/TreeifyTab/Internal/SearchEngine/SearchEngine'
import { ExportFormat, State } from 'src/TreeifyTab/Internal/State'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { Timestamp } from 'src/Utility/Timestamp'

/** TODO: コメント */
export class Internal {
  static #instance: Internal | undefined

  state: State
  /** Treeifyの項目の全文検索エンジン */
  searchEngine: SearchEngine

  // TODO: スタック化する
  readonly undoStack = new Map<ChunkId, any>()

  private readonly onMutateListeners = new Set<(propertyPath: PropertyPath) => void>()

  private constructor(initialState: State) {
    this.state = initialState
    this.searchEngine = new SearchEngine(this.state)
  }

  /**
   * シングルトンインスタンスを生成する。
   * 生成されたインスタンスは.instanceで取得できる。
   */
  static initialize(initialState: State) {
    this.#instance = new Internal(initialState)
  }

  /**
   * シングルトンインスタンスを取得する。
   * 通常のシングルトンと異なり、インスタンスを自動生成する機能は無いので要注意。
   * インスタンス未生成の場合はエラー。
   */
  static get instance(): Internal {
    assertNonUndefined(this.#instance)
    return this.#instance
  }

  /** シングルトンインスタンスを破棄する */
  static cleanup() {
    this.#instance = undefined
  }

  /** State内の指定されたプロパティを書き換える */
  mutate(value: any, propertyPath: PropertyPath) {
    const propertyKeys = PropertyPath.splitToPropertyKeys(propertyPath)
    const parentObject = Internal.getParentObject(propertyKeys, this.state)
    const lastKey = propertyKeys.last(undefined)
    assertNonUndefined(lastKey)

    if (parentObject[lastKey] !== value) {
      // Undo用にミューテート前のデータを退避する
      const chunkId = Chunk.convertToChunkId(propertyPath)
      if (!this.undoStack.has(chunkId)) {
        this.undoStack.set(chunkId, Chunk.create(this.state, chunkId).data)
      }

      parentObject[lastKey] = value

      for (const onMutateListener of this.onMutateListeners) {
        onMutateListener(propertyPath)
      }
    }
  }

  /** State内の指定されたプロパティを削除する */
  delete(propertyPath: PropertyPath) {
    const propertyKeys = PropertyPath.splitToPropertyKeys(propertyPath)
    const parentObject = Internal.getParentObject(propertyKeys, this.state)
    const lastKey = propertyKeys.last(undefined)
    assertNonUndefined(lastKey)

    // Undo用にミューテート前のデータを退避する
    const chunkId = Chunk.convertToChunkId(propertyPath)
    if (!this.undoStack.has(chunkId)) {
      this.undoStack.set(chunkId, Chunk.create(this.state, chunkId).data)
    }

    delete parentObject[lastKey]

    for (const onMutateListener of this.onMutateListeners) {
      onMutateListener(propertyPath)
    }
  }

  private static getParentObject(propertyKeys: List<string>, state: any): any {
    if (propertyKeys.size === 1) {
      return state
    } else {
      const firstKey = propertyKeys.first(undefined)
      assertNonUndefined(firstKey)

      return this.getParentObject(propertyKeys.shift(), state[firstKey])
    }
  }

  addOnMutateListener(listener: (propertyPath: PropertyPath) => void) {
    this.onMutateListeners.add(listener)
  }

  /** 現在のStateをUndoスタックに保存する */
  saveCurrentStateToUndoStack() {
    this.undoStack.clear()

    External.instance.prevPendingMutatedChunkIds = new Set<ChunkId>(
      External.instance.pendingMutatedChunkIds
    )
  }

  undo() {
    for (const [chunkId, savedData] of this.undoStack) {
      const propertyKeys = PropertyPath.splitToPropertyKeys(chunkId)
      const parentObject = Internal.getParentObject(propertyKeys, this.state)
      const lastKey = propertyKeys.last(undefined)
      assertNonUndefined(lastKey)

      if (savedData !== undefined) {
        parentObject[lastKey] = savedData
      } else {
        delete parentObject[lastKey]
      }
    }
    this.undoStack.clear()
  }

  dumpCurrentState() {
    console.groupCollapsed('ダンプ：Internal#state')
    const stateString = JSON.stringify(this.state, State.jsonReplacer, 2)
    console.log(stateString)
    console.groupEnd()
  }

  static createInitialState(): State {
    return {
      items: {
        0: {
          type: ItemType.TEXT,
          // トップページはどのインスタンスで生成されたかを問わず同一視したい特別な項目なので専用のグローバル項目IDを持つ
          globalItemId: 'Treeify#0',
          childItemIds: List(),
          parents: {},
          timestamp: Timestamp.now(),
          cssClasses: List(),
          source: null,
        },
      },
      textItems: {
        0: {
          domishObjects: List.of({ type: 'text', textContent: 'Top' }),
        },
      },
      webPageItems: {},
      imageItems: {},
      codeBlockItems: {},
      texItems: {},
      pages: {
        0: {
          targetItemPath: List.of(0),
          anchorItemPath: List.of(0),
        },
      },
      workspaces: {
        [Timestamp.now()]: {
          name: 'ワークスペース1',
          activePageId: 0,
          excludedItemIds: List(),
          searchHistory: List(),
        },
      },
      mountedPageIds: List.of(0),
      availableItemIds: List(),
      maxItemId: 0,
      mainAreaKeyBindings: {
        '0000Enter': List.of('enterKeyDefault'),
        '0100Enter': List.of('insertNewline'),
        '1100Enter': List.of('createTextItem'),
        '1000KeyD': List.of('removeItem'),
        '1100KeyD': List.of('deleteJustOneItem'),
        '1100Backspace': List.of('removeItem'),
        '1000ArrowUp': List.of('moveItemToPrevSibling'),
        '1000ArrowDown': List.of('moveItemToNextSibling'),
        '1100ArrowUp': List.of('moveItemToAbove'),
        '1100ArrowDown': List.of('moveItemToBelow'),
        '0000Tab': List.of('indent'),
        '0100Tab': List.of('unindent'),
        '1000KeyG': List.of('grouping'),
        '1000KeyP': List.of('toggleFolded'),
        '0010ArrowUp': List.of('fold'),
        '0010ArrowDown': List.of('unfold'),
        '1000KeyB': List.of('toggleBold'),
        '1000KeyU': List.of('toggleUnderline'),
        '1000KeyI': List.of('toggleItalic'),
        '1000KeyK': List.of('toggleStrikethrough'),
        '1000Enter': List.of('toggleCompleted'),
        '1000KeyH': List.of('toggleHighlighted'),
        '1100KeyU': List.of('toggleDoubtful'),
        '0010KeyC': List.of('copyForTransclude'),
        '1100KeyX': List.of('copyForMove'),
        '1100KeyV': List.of('pasteAsPlainText'),
        '1000KeyS': List.of('syncWithDataFolder'),
        '1100KeyF': List.of('showSearchDialog'),
        '1100KeyR': List.of('showReplaceDialog'),
        '1000Slash': List.of('showCommandPaletteDialog'),
        '0000F2': List.of('showEditDialog'),
        '0000ContextMenu': List.of('showContextMenuDialog'),
        '1100Period': List.of('toggleSource'),
        '0110ArrowUp': List.of('selectToStartOfList'),
        '0110ArrowDown': List.of('selectToEndOfList'),
      },
      customCss: '',
      exportSettings: {
        selectedFormat: ExportFormat.PLAIN_TEXT,
        options: {
          [ExportFormat.PLAIN_TEXT]: {
            ignoreInvisibleItems: true,
            indentationExpression: '  ',
          },
          [ExportFormat.MARKDOWN]: {
            ignoreInvisibleItems: false,
            minimumHeaderLevel: 1,
          },
          [ExportFormat.OPML]: {
            ignoreInvisibleItems: false,
          },
        },
      },
      leftEndMouseGestureEnabled: true,
      rightEndMouseGestureEnabled: false,
    }
  }
}
