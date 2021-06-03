import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'

/** TODO: コメント */
export class Internal {
  private static _instance: Internal | undefined

  readonly state: State = Internal.createSampleState()

  private readonly mutatedPropertyPaths = new Set<PropertyPath>()
  private readonly stateChangeListeners = new Set<
    (newState: State, mutatedPropertyPaths: Set<PropertyPath>) => void
  >()

  private constructor(initialState: State) {
    this.state = initialState
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

  /** Stateへの変更を確定し、stateChangeListenerに通知する */
  commit() {
    for (const stateChangeListener of this.stateChangeListeners) {
      stateChangeListener(this.state, this.mutatedPropertyPaths)
    }
    this.mutatedPropertyPaths.clear()
  }

  /** State内の書き換えた箇所を伝える */
  markAsMutated(propertyPath: PropertyPath) {
    this.mutatedPropertyPaths.add(propertyPath)
  }

  addStateChangeListener(
    listener: (newState: State, mutatedPropertyPaths: Set<PropertyPath>) => void
  ) {
    this.stateChangeListeners.add(listener)
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
      pages: {
        0: {
          targetItemPath: List.of(0),
          anchorItemPath: List.of(0),
          defaultWindowMode: 'keep',
        },
      },
      workspaces: {
        [Timestamp.now()]: {
          excludedItemIds: List.of(),
          name: 'ワークスペース1',
        },
      },
      mountedPageIds: List.of(0),
      availableItemIds: List.of(),
      maxItemId: 0,
      itemTreeKeyboardBinding: {
        '0000Tab': List.of({commandName: 'indentItem'}),
        '0100Tab': List.of({commandName: 'unindentItem'}),
        '1000ArrowUp': List.of({commandName: 'moveItemToPrevSibling'}),
        '1000ArrowDown': List.of({commandName: 'moveItemToNextSibling'}),
        '1100ArrowUp': List.of({commandName: 'moveItemUpward'}),
        '1100ArrowDown': List.of({commandName: 'moveItemDownward'}),
        '0000Enter': List.of({commandName: 'enterKeyDefault'}),
        '0100Enter': List.of({commandName: 'insertLineBreak'}),
        '1000Enter': List.of({commandName: 'toggleGrayedOut'}),
        '1000KeyT': List.of({commandName: 'toDualWindowMode'}, {commandName: 'openNewTab'}),
        '1000KeyL': List.of({commandName: 'toggleHighlighted'}),
        '1000KeyD': List.of({commandName: 'removeEdge'}),
        '1000KeyP': List.of({commandName: 'toggleCollapsed'}),
        '1000KeyO': List.of({commandName: 'toggleBold'}),
        '1000KeyU': List.of({commandName: 'toggleUnderline'}),
        '1000KeyI': List.of({commandName: 'toggleItalic'}),
        '1000KeyK': List.of({commandName: 'toggleStrikethrough'}),
        '1000KeyS': List.of({commandName: 'saveToDataFolder'}),
        '0010KeyC': List.of({commandName: 'copyForTransclusion'}),
        '1100KeyL': List.of({commandName: 'createEmptyCodeBlockItem'}),
        '0010KeyW': List.of({commandName: 'showDefaultWindowModeSettingDialog'}),
        '0110KeyW': List.of({commandName: 'showWorkspaceDialog'}),
        '0010KeyE': List.of({commandName: 'excludeFromCurrentWorkspace'}),
        '0000F2': List.of({commandName: 'edit'}),
        '0100F2': List.of({commandName: 'showLabelEditDialog'}),
        '0000F3': List.of({commandName: 'showOtherParentsDialog'}),
        '0110ArrowDown': List.of({commandName: 'selectAllBelowItems'}),
        '0110ArrowUp': List.of({commandName: 'selectAllAboveItems'}),
      },
      itemTreeDeleteButtonMouseBinding: {
        '0000MouseButton0': List.of({commandName: 'removeEdge'}),
        '1000MouseButton0': List.of({commandName: 'deleteItemItself'}),
      },
      webPageItemTitleSettingDialog: null,
      codeBlockItemEditDialog: null,
      defaultWindowModeSettingDialog: null,
      workspaceDialog: null,
      labelEditDialog: null,
      otherParentsDialog: null,
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
        },
        1: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(3, 6, 7),
          parents: {0: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090001,
          cssClasses: List.of(),
        },
        2: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(4),
          parents: {0: {isCollapsed: true, labels: List.of()}},
          timestamp: 1604284090002,
          cssClasses: List.of(),
        },
        3: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parents: {1: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090003,
          cssClasses: List.of(),
        },
        4: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parents: {2: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090004,
          cssClasses: List.of('grayed-out'),
        },
        5: {
          itemType: ItemType.WEB_PAGE,
          childItemIds: List.of(),
          parents: {0: {isCollapsed: false, labels: List.of('サンプル')}},
          timestamp: 1604284090005,
          cssClasses: List.of(),
        },
        6: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parents: {1: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090006,
          cssClasses: List.of(),
        },
        7: {
          itemType: ItemType.IMAGE,
          childItemIds: List.of(),
          parents: {1: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090007,
          cssClasses: List.of(),
        },
        8: {
          itemType: ItemType.CODE_BLOCK,
          childItemIds: List.of(),
          parents: {0: {isCollapsed: false, labels: List.of()}},
          timestamp: 1604284090008,
          cssClasses: List.of(),
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
          url:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tamias_striatus2.jpg/320px-Tamias_striatus2.jpg',
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
          excludedItemIds: List.of(),
          name: 'ワークスペース1',
        },
      },
      mountedPageIds: List.of(0),
      availableItemIds: List.of(),
      maxItemId: 8,
      itemTreeKeyboardBinding: {
        '0000Tab': List.of({commandName: 'indentItem'}),
        '0100Tab': List.of({commandName: 'unindentItem'}),
        '1000ArrowUp': List.of({commandName: 'moveItemToPrevSibling'}),
        '1000ArrowDown': List.of({commandName: 'moveItemToNextSibling'}),
        '1100ArrowUp': List.of({commandName: 'moveItemUpward'}),
        '1100ArrowDown': List.of({commandName: 'moveItemDownward'}),
        '0000Enter': List.of({commandName: 'enterKeyDefault'}),
        '0100Enter': List.of({commandName: 'insertLineBreak'}),
        '1000Enter': List.of({commandName: 'toggleGrayedOut'}),
        '1000KeyT': List.of({commandName: 'toDualWindowMode'}, {commandName: 'openNewTab'}),
        '1000KeyL': List.of({commandName: 'toggleHighlighted'}),
        '1000KeyD': List.of({commandName: 'removeEdge'}),
        '1000KeyP': List.of({commandName: 'toggleCollapsed'}),
        '1000KeyO': List.of({commandName: 'toggleBold'}),
        '1000KeyU': List.of({commandName: 'toggleUnderline'}),
        '1000KeyI': List.of({commandName: 'toggleItalic'}),
        '1000KeyK': List.of({commandName: 'toggleStrikethrough'}),
        '1000KeyS': List.of({commandName: 'saveToDataFolder'}),
        '0010KeyC': List.of({commandName: 'copyForTransclusion'}),
        '1100KeyL': List.of({commandName: 'createEmptyCodeBlockItem'}),
        '0010KeyW': List.of({commandName: 'showDefaultWindowModeSettingDialog'}),
        '0110KeyW': List.of({commandName: 'showWorkspaceDialog'}),
        '0010KeyE': List.of({commandName: 'excludeFromCurrentWorkspace'}),
        '0000F2': List.of({commandName: 'edit'}),
        '0100F2': List.of({commandName: 'showLabelEditDialog'}),
        '0000F3': List.of({commandName: 'showOtherParentsDialog'}),
        '0110ArrowDown': List.of({commandName: 'selectAllBelowItems'}),
        '0110ArrowUp': List.of({commandName: 'selectAllAboveItems'}),
      },
      itemTreeDeleteButtonMouseBinding: {
        '0000MouseButton0': List.of({commandName: 'removeEdge'}),
        '1000MouseButton0': List.of({commandName: 'deleteItemItself'}),
      },
      webPageItemTitleSettingDialog: null,
      codeBlockItemEditDialog: null,
      defaultWindowModeSettingDialog: null,
      workspaceDialog: null,
      labelEditDialog: null,
      otherParentsDialog: null,
    }
  }
}
