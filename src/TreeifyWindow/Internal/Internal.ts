import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'

/** TODO: コメント */
export class Internal {
  private static _instance: Internal | undefined

  readonly state: State = Internal.createInitialState()

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
          childItemIds: List.of(1, 2, 5, 8),
          parents: {},
          timestamp: 1604284090000,
          cssClasses: List.of(),
        },
        1: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(3, 6, 7),
          parents: {0: {isCollapsed: false}},
          timestamp: 1604284090001,
          cssClasses: List.of(),
        },
        2: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(4),
          parents: {0: {isCollapsed: true}},
          timestamp: 1604284090002,
          cssClasses: List.of(),
        },
        3: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parents: {1: {isCollapsed: false}},
          timestamp: 1604284090003,
          cssClasses: List.of(),
        },
        4: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parents: {2: {isCollapsed: false}},
          timestamp: 1604284090004,
          cssClasses: List.of('grayed-out-item'),
        },
        5: {
          itemType: ItemType.WEB_PAGE,
          childItemIds: List.of(),
          parents: {0: {isCollapsed: false}},
          timestamp: 1604284090005,
          cssClasses: List.of(),
        },
        6: {
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parents: {1: {isCollapsed: false}},
          timestamp: 1604284090006,
          cssClasses: List.of(),
        },
        7: {
          itemType: ItemType.IMAGE,
          childItemIds: List.of(),
          parents: {1: {isCollapsed: false}},
          timestamp: 1604284090007,
          cssClasses: List.of(),
        },
        8: {
          itemType: ItemType.CODE_BLOCK,
          childItemIds: List.of(),
          parents: {0: {isCollapsed: false}},
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
          code: `
const url = 'https://google.com/'
if (url.length > 10 || /https:/.test(url)) {
  console.log(\`OK: \${url.length}\`)
}
`,
        },
      },
      pages: {
        '0': {
          targetItemPath: List.of(0),
          anchorItemPath: List.of(0),
        },
        '6': {
          targetItemPath: List.of(6),
          anchorItemPath: List.of(6),
        },
      },
      mountedPageIds: List.of(0),
      availableItemIds: List.of(),
      maxItemId: 8,
      activePageId: 0,
      itemTreeInputBinding: {
        '0000Tab': {functionName: 'indentItem'},
        '0100Tab': {functionName: 'unindentItem'},
        '1000ArrowUp': {functionName: 'moveItemUpward'},
        '1000ArrowDown': {functionName: 'moveItemDownward'},
        '0000Enter': {functionName: 'enterKeyDefault'},
        '0100Enter': {functionName: 'insertLineBreak'},
        '1000Enter': {functionName: 'toggleGrayedOut'},
        '1000l': {functionName: 'toggleHighlighted'},
        '1000d': {functionName: 'deleteItem'},
        '1000p': {functionName: 'toggleCollapsed'},
        '1000o': {functionName: 'toggleBold'},
        '1000u': {functionName: 'toggleUnderline'},
        '1000i': {functionName: 'toggleItalic'},
        '1000k': {functionName: 'toggleStrikethrough'},
        '1000s': {functionName: 'saveToDataFolder'},
        '1100c': {functionName: 'copyForTransclusion'},
        '0000F2': {functionName: 'edit'},
        '0110ArrowDown': {functionName: 'selectAllBelowItems'},
        '0110ArrowUp': {functionName: 'selectAllAboveItems'},
      },
      webPageItemTitleSettingDialog: null,
    }
  }
}
