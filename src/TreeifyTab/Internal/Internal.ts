import objectPath from 'object-path'
import { ItemType } from 'src/TreeifyTab/basicType'
import { Chunk, ChunkId } from 'src/TreeifyTab/Internal/Chunk'
import { SearchEngine } from 'src/TreeifyTab/Internal/SearchEngine/SearchEngine'
import { CURRENT_SCHEMA_VERSION, ExportFormat, State } from 'src/TreeifyTab/Internal/State'
import { PathValue, StatePath } from 'src/TreeifyTab/Internal/StatePath'
import { assertNonUndefined } from 'src/Utility/Debug/assert'
import { Timestamp } from 'src/Utility/Timestamp'

/** TODO: コメント */
export class Internal {
  static #instance: Internal | undefined

  state: State
  /** Treeifyの項目の全文検索エンジン */
  searchEngine: SearchEngine

  readonly undoStack: Map<ChunkId, any>[] = [new Map()]
  static UNDO_STACK_SIZE_LIMIT = 7

  private readonly onMutateListeners = new Set<(statePath: StatePath) => void>()

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
  mutate<T extends StatePath>(value: PathValue<T>, statePath: T) {
    const propertyKeys = statePath.map(String)
    if (objectPath.get(this.state, propertyKeys) !== value) {
      // Undo用にミューテート前のデータを退避する
      const chunkId = Chunk.convertToChunkId(statePath)
      if (!this.undoStackTop.has(chunkId)) {
        this.undoStackTop.set(chunkId, Chunk.create(this.state, chunkId).data)
      }

      objectPath.set(this.state, propertyKeys, value)

      for (const onMutateListener of this.onMutateListeners) {
        onMutateListener(statePath)
      }
    }
  }

  /** State内の指定されたプロパティを削除する */
  delete(statePath: StatePath) {
    // Undo用にミューテート前のデータを退避する
    const chunkId = Chunk.convertToChunkId(statePath)
    if (!this.undoStackTop.has(chunkId)) {
      this.undoStackTop.set(chunkId, Chunk.create(this.state, chunkId).data)
    }

    const propertyKeys = statePath.map(String)
    objectPath.del(this.state, propertyKeys)

    for (const onMutateListener of this.onMutateListeners) {
      onMutateListener(statePath)
    }
  }

  addOnMutateListener(listener: (statePath: StatePath) => void) {
    this.onMutateListeners.add(listener)
  }

  get undoStackTop() {
    return this.undoStack[this.undoStack.length - 1]
  }

  /** 現在のStateをUndoスタックに保存する */
  saveCurrentStateToUndoStack() {
    this.undoStack.push(new Map())
    if (this.undoStack.length > Internal.UNDO_STACK_SIZE_LIMIT) {
      this.undoStack.shift()
    }
  }

  undo() {
    for (const [chunkId, savedData] of this.undoStackTop) {
      const propertyKeys = chunkId.split(Chunk.delimiter)
      if (savedData !== undefined) {
        objectPath.set(this.state, propertyKeys, savedData)
      } else {
        objectPath.del(this.state, propertyKeys)
      }
    }
    if (this.undoStack.length === 1) {
      this.undoStackTop.clear()
    } else {
      this.undoStack.pop()
    }
  }

  dumpCurrentState() {
    console.groupCollapsed('ダンプ：Internal#state')
    const stateString = JSON.stringify(this.state, undefined, 2)
    console.log(stateString)
    console.groupEnd()
  }

  static createInitialState(): State {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      items: {
        0: {
          type: ItemType.TEXT,
          // トップページはどのインスタンスで生成されたかを問わず同一視したい特別な項目なので専用のグローバル項目IDを持つ
          globalItemId: 'Treeify#0',
          childItemIds: [],
          parents: {},
          timestamp: Timestamp.now(),
          cssClasses: [],
          source: null,
        },
      },
      textItems: {
        0: {
          domishObjects: [{ type: 'text', textContent: 'Top' }],
        },
      },
      webPageItems: {},
      imageItems: {},
      codeBlockItems: {},
      texItems: {},
      pages: {
        0: {
          targetItemPath: [0],
          anchorItemPath: [0],
        },
      },
      reminders: {},
      workspaces: {
        [Timestamp.now()]: {
          name: 'ワークスペース1',
          activePageId: 0,
          excludedItemIds: [],
          searchHistory: [],
        },
      },
      mountedPageIds: [0],
      availableItemIds: [],
      maxItemId: 0,
      mainAreaKeyBindings: {
        '0000Enter': ['enterKeyDefault'],
        '0100Enter': ['insertNewline'],
        '1100Enter': ['createTextItem'],
        '1000KeyD': ['removeItem'],
        '1100KeyD': ['deleteJustOneItem'],
        '1100Backspace': ['removeItem'],
        '1000ArrowUp': ['moveItemToPrevSibling'],
        '1000ArrowDown': ['moveItemToNextSibling'],
        '1100ArrowUp': ['moveItemToAbove'],
        '1100ArrowDown': ['moveItemToBelow'],
        '0000Tab': ['indent'],
        '0100Tab': ['unindent'],
        '1000KeyG': ['grouping'],
        '1000KeyL': ['toggleFolded'],
        '1000KeyB': ['toggleBold'],
        '1000KeyU': ['toggleUnderline'],
        '1000KeyI': ['toggleItalic'],
        '1000KeyK': ['toggleStrikethrough'],
        '1000Enter': ['toggleCompleted'],
        '1000KeyH': ['toggleHighlighted'],
        '1100KeyU': ['toggleDoubtful'],
        '0010KeyC': ['copyForTransclude'],
        '1100KeyX': ['copyForMove'],
        '1100KeyV': ['pasteAsPlainText'],
        '1000KeyS': ['syncTreeifyData'],
        '1100KeyF': ['showSearchDialog'],
        '1100KeyR': ['showReplaceDialog'],
        '1000Slash': ['showCommandPaletteDialog'],
        '0000F2': ['showEditDialog'],
        '0000ContextMenu': ['showContextMenuDialog'],
        '1100Period': ['toggleSource'],
        '0010ArrowUp': ['focusFirstSibling'],
        '0010ArrowDown': ['focusLastSibling'],
        '0110ArrowUp': ['selectToFirstSibling'],
        '0110ArrowDown': ['selectToLastSibling'],
      },
      customCss: '',
      preferredLanguages: {},
      exportSettings: {
        selectedFormat: ExportFormat.PLAIN_TEXT,
        options: {
          [ExportFormat.PLAIN_TEXT]: {
            includeInvisibleItems: false,
            indentationExpression: '  ',
          },
          [ExportFormat.MARKDOWN]: {
            includeInvisibleItems: true,
            minimumHeaderLevel: 1,
          },
          [ExportFormat.OPML]: {
            includeInvisibleItems: true,
          },
        },
      },
      autoSyncWhenDetectSync: true,
      leftEndMouseGestureEnabled: true,
      rightEndMouseGestureEnabled: false,
    }
  }
}
