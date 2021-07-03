import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyTab/basicType'
import {External} from 'src/TreeifyTab/External/External'
import {ChunkId} from 'src/TreeifyTab/Internal/Chunk'
import {showCitationSettingDialog} from 'src/TreeifyTab/Internal/NullaryCommand/dialog'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {SearchEngine} from 'src/TreeifyTab/Internal/SearchEngine/SearchEngine'
import {State} from 'src/TreeifyTab/Internal/State'
import {Timestamp} from 'src/TreeifyTab/Timestamp'

/** TODO: コメント */
export class Internal {
  private static _instance: Internal | undefined

  state: State
  /** Treeifyの項目の全文検索エンジン */
  readonly searchEngine: SearchEngine

  /**
   * Undo用。1つ前のState。
   * 現状の実装ではUndoスタックの深さは1が上限である。
   */
  prevState: State | undefined

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
    this._instance = new Internal(initialState)
  }

  /**
   * シングルトンインスタンスを取得する。
   * 通常のシングルトンと異なり、インスタンスを自動生成する機能は無いので要注意。
   * インスタンス未生成の場合はエラー。
   */
  static get instance(): Internal {
    assertNonUndefined(this._instance)
    return this._instance
  }

  /** シングルトンインスタンスを破棄する */
  static cleanup() {
    this._instance = undefined
  }

  /** State内の指定されたプロパティを書き換える */
  mutate(value: any, propertyPath: PropertyPath) {
    const propertyKeys = PropertyPath.splitToPropertyKeys(propertyPath)
    if (Internal._mutate(value, propertyKeys, this.state)) {
      for (let onMutateListener of this.onMutateListeners) {
        onMutateListener(propertyPath)
      }
    }
  }

  // 指定されたプロパティに値を設定する。
  // 設定前後で値が変わらなかったら（===だったら）falseを返す
  private static _mutate(value: any, propertyKeys: List<string>, state: any): boolean {
    const firstKey = propertyKeys.first(undefined)
    assertNonUndefined(firstKey)

    if (propertyKeys.size === 1) {
      if (state[firstKey] !== value) {
        state[firstKey] = value
        return true
      } else {
        return false
      }
    } else {
      return this._mutate(value, propertyKeys.shift(), state[firstKey])
    }
  }

  /** State内の指定されたプロパティを削除する */
  delete(propertyPath: PropertyPath) {
    const propertyKeys = PropertyPath.splitToPropertyKeys(propertyPath)
    Internal._delete(propertyKeys, this.state)
    for (let onMutateListener of this.onMutateListeners) {
      onMutateListener(propertyPath)
    }
  }

  private static _delete(propertyKeys: List<string>, state: any) {
    const firstKey = propertyKeys.first(undefined)
    assertNonUndefined(firstKey)

    if (propertyKeys.size === 1) {
      delete state[firstKey]
    } else {
      this._delete(propertyKeys.shift(), state[firstKey])
    }
  }

  addOnMutateListener(listener: (propertyPath: PropertyPath) => void) {
    this.onMutateListeners.add(listener)
  }

  /** 現在のStateをUndoスタックに保存する */
  saveCurrentStateToUndoStack() {
    // TODO: 最適化の余地あり。毎回cloneするのではなく、パッチを適用する形にできると思う
    this.prevState = State.clone(this.state)

    External.instance.prevPendingMutatedChunkIds = new Set<ChunkId>(
      External.instance.pendingMutatedChunkIds
    )
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
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parents: {},
          timestamp: Timestamp.now(),
          cssClasses: List.of(),
          cite: '',
          citeUrl: '',
        },
      },
      textItems: {
        0: {
          domishObjects: List.of({type: 'text', textContent: 'Top'}),
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
          defaultWindowMode: 'keep',
        },
      },
      workspaces: {
        [Timestamp.now()]: {
          activePageId: 0,
          excludedItemIds: List.of(),
          name: 'ワークスペース1',
        },
      },
      mountedPageIds: List.of(0),
      availableItemIds: List.of(),
      maxItemId: 0,
      mainAreaKeyboardBinding: {
        '0000Tab': List.of({commandName: 'indentItem'}),
        '0100Tab': List.of({commandName: 'unindentItem'}),
        '1000ArrowUp': List.of({commandName: 'moveItemToPrevSibling'}),
        '1000ArrowDown': List.of({commandName: 'moveItemToNextSibling'}),
        '1100ArrowUp': List.of({commandName: 'moveItemUpward'}),
        '1100ArrowDown': List.of({commandName: 'moveItemDownward'}),
        '0110ArrowDown': List.of({commandName: 'selectAllBelowItems'}),
        '0110ArrowUp': List.of({commandName: 'selectAllAboveItems'}),
        '0000Enter': List.of({commandName: 'enterKeyDefault'}),
        '0100Enter': List.of({commandName: 'insertLineBreak'}),
        '1000Enter': List.of(
          {commandName: 'hardUnloadSubtree'},
          {commandName: 'collapseItem'},
          {commandName: 'toggleGrayedOut'}
        ),
        '1000KeyA': List.of({commandName: 'selectAll'}),
        '1000KeyH': List.of({commandName: 'toggleHighlighted'}),
        '1000KeyG': List.of({commandName: 'groupingItems'}),
        '1000KeyD': List.of({commandName: 'removeEdge'}),
        '1000KeyP': List.of({commandName: 'toggleCollapsed'}),
        '1000KeyB': List.of({commandName: 'toggleBold'}),
        '1000KeyU': List.of({commandName: 'toggleDoubtful'}),
        '1000KeyI': List.of({commandName: 'toggleItalic'}),
        '1000KeyK': List.of({commandName: 'toggleStrikethrough'}),
        '1000KeyS': List.of({commandName: 'saveToDataFolder'}),
        '0010KeyC': List.of({commandName: 'copyForTransclusion'}),
        '1100KeyF': List.of({commandName: 'showSearchDialog'}),
        '0110KeyW': List.of({commandName: 'showWorkspaceDialog'}),
        '0010KeyE': List.of({commandName: 'excludeFromCurrentWorkspace'}),
        '0000F2': List.of({commandName: 'edit'}),
        '0100F2': List.of({commandName: 'showLabelSettingDialog'}),
        '0000F3': List.of({commandName: 'showOtherParentsDialog'}),
        '0000F4': List.of({commandName: 'showCitationSettingDialog'}),
      },
      mainAreaDeleteButtonMouseBinding: {
        '0000MouseButton0': List.of({commandName: 'removeEdge'}),
        '1000MouseButton0': List.of({commandName: 'deleteItemItself'}),
      },
      dialog: null,
    }
  }

  static createSampleState(): State {
    return {
      items: {
        0: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(1, 2, 5, 8),
          parents: {},
          timestamp: 1604284090000,
          cssClasses: List.of(),
          cite: '',
          citeUrl: '',
        },
        1: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(3, 6, 7),
          parents: {0: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090001,
          cssClasses: List.of(),
          cite: '',
          citeUrl: '',
        },
        2: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(4),
          parents: {0: {isCollapsed: true, labels: List.of()}},
          timestamp: 1604284090002,
          cssClasses: List.of(),
          cite: '',
          citeUrl: '',
        },
        3: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parents: {1: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090003,
          cssClasses: List.of(),
          cite: '',
          citeUrl: '',
        },
        4: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parents: {2: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090004,
          cssClasses: List.of('grayed-out'),
          cite: '',
          citeUrl: '',
        },
        5: {
          itemType: ItemType.WEB_PAGE,
          childItemIds: List.of(),
          parents: {0: {isCollapsed: false, labels: List.of('サンプル')}},
          timestamp: 1604284090005,
          cssClasses: List.of(),
          cite: '',
          citeUrl: '',
        },
        6: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parents: {1: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090006,
          cssClasses: List.of(),
          cite: '',
          citeUrl: '',
        },
        7: {
          itemType: ItemType.IMAGE,
          childItemIds: List.of(),
          parents: {1: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090007,
          cssClasses: List.of(),
          cite: 'Tamias - Wikipedia',
          citeUrl: 'https://en.wikipedia.org/wiki/Tamias',
        },
        8: {
          itemType: ItemType.CODE_BLOCK,
          childItemIds: List.of(),
          parents: {0: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090008,
          cssClasses: List.of(),
          cite: '',
          citeUrl: '',
        },
      },
      textItems: {
        0: {
          domishObjects: List.of({type: 'text', textContent: 'Top'}),
        },
        1: {
          domishObjects: List.of({type: 'text', textContent: 'isCollapsed false'}),
        },
        2: {
          domishObjects: List.of({type: 'text', textContent: 'isCollapsed true'}),
        },
        3: {
          domishObjects: List.of({type: 'text', textContent: 'visible child'}),
        },
        4: {
          domishObjects: List.of({type: 'text', textContent: 'invisible child'}),
        },
        6: {
          domishObjects: List.of({type: 'text', textContent: '子ページ'}),
        },
      },
      webPageItems: {
        5: {
          url: 'https://ao-system.net/favicon/',
          faviconUrl: 'https://ao-system.net/favicon.ico',
          tabTitle: 'ファビコン作成 favicon.ico 無料で半透過マルチアイコンが作れます',
          title: null,
          isUnread: true,
        },
      },
      imageItems: {
        7: {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tamias_striatus2.jpg/320px-Tamias_striatus2.jpg',
          caption: 'tamias',
        },
      },
      codeBlockItems: {
        8: {
          code:
            "const url = 'https://google.com/'\n" +
            'if (url.length > 10 || /https:/.test(url)) {\n' +
            '  console.log(`OK: ${url.length}`)\n' +
            '}\n',
          language: 'javascript',
        },
      },
      texItems: {},
      pages: {
        0: {
          targetItemPath: List.of(0),
          anchorItemPath: List.of(0),
          defaultWindowMode: 'keep',
        },
        6: {
          targetItemPath: List.of(6),
          anchorItemPath: List.of(6),
          defaultWindowMode: 'inherit',
        },
      },
      workspaces: {
        [Timestamp.now()]: {
          activePageId: 0,
          excludedItemIds: List.of(),
          name: 'ワークスペース1',
        },
      },
      mountedPageIds: List.of(0),
      availableItemIds: List.of(),
      maxItemId: 8,
      mainAreaKeyboardBinding: {
        '0000Tab': List.of({commandName: 'indentItem'}),
        '0100Tab': List.of({commandName: 'unindentItem'}),
        '1000ArrowUp': List.of({commandName: 'moveItemToPrevSibling'}),
        '1000ArrowDown': List.of({commandName: 'moveItemToNextSibling'}),
        '1100ArrowUp': List.of({commandName: 'moveItemUpward'}),
        '1100ArrowDown': List.of({commandName: 'moveItemDownward'}),
        '0110ArrowDown': List.of({commandName: 'selectAllBelowItems'}),
        '0110ArrowUp': List.of({commandName: 'selectAllAboveItems'}),
        '0000Enter': List.of({commandName: 'enterKeyDefault'}),
        '0100Enter': List.of({commandName: 'insertLineBreak'}),
        '1000Enter': List.of(
          {commandName: 'hardUnloadSubtree'},
          {commandName: 'collapseItem'},
          {commandName: 'toggleGrayedOut'}
        ),
        '1000KeyA': List.of({commandName: 'selectAll'}),
        '1000KeyH': List.of({commandName: 'toggleHighlighted'}),
        '1000KeyG': List.of({commandName: 'groupingItems'}),
        '1000KeyD': List.of({commandName: 'removeEdge'}),
        '1000KeyP': List.of({commandName: 'toggleCollapsed'}),
        '1000KeyB': List.of({commandName: 'toggleBold'}),
        '1000KeyU': List.of({commandName: 'toggleDoubtful'}),
        '1000KeyI': List.of({commandName: 'toggleItalic'}),
        '1000KeyK': List.of({commandName: 'toggleStrikethrough'}),
        '1000KeyS': List.of({commandName: 'saveToDataFolder'}),
        '0010KeyC': List.of({commandName: 'copyForTransclusion'}),
        '1100KeyF': List.of({commandName: 'showSearchDialog'}),
        '0110KeyW': List.of({commandName: 'showWorkspaceDialog'}),
        '0010KeyE': List.of({commandName: 'excludeFromCurrentWorkspace'}),
        '0000F2': List.of({commandName: 'edit'}),
        '0100F2': List.of({commandName: 'showLabelSettingDialog'}),
        '0000F3': List.of({commandName: 'showOtherParentsDialog'}),
        '0000F4': List.of({commandName: 'showCitationSettingDialog'}),
      },
      mainAreaDeleteButtonMouseBinding: {
        '0000MouseButton0': List.of({commandName: 'removeEdge'}),
        '1000MouseButton0': List.of({commandName: 'deleteItemItself'}),
      },
      dialog: null,
    }
  }
}
