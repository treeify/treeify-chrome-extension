import {List} from 'immutable'
import {ItemType} from 'src/Common/basicType'
import {Batchizer, PropertyPath} from 'src/TreeifyWindow/Internal/Batchizer'
import {State} from 'src/TreeifyWindow/Internal/State'
import {assertNonUndefined} from 'src/Common/Debug/assert'

/** TODO: コメント */
export class Internal {
  private static _instance: Internal | undefined

  private constructor(initialState: State) {
    this.currentState = initialState
    this.nextState = new Batchizer(this.currentState)
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

  private readonly stateChangeListeners = new Set<
    (newState: State, mutatedPropertyPaths: Set<PropertyPath>) => void
  >()
  readonly currentState: State = Internal.createInitialState()
  readonly nextState: Batchizer = new Batchizer(this.currentState)

  /** Stateへの変更を確定し、Viewに通知する */
  commit() {
    const mutatedPropertyPaths = this.nextState.commit()
    for (const stateChangeListener of this.stateChangeListeners) {
      stateChangeListener(this.currentState, mutatedPropertyPaths)
    }
  }

  addStateChangeListener(
    listener: (newState: State, mutatedPropertyPaths: Set<PropertyPath>) => void
  ) {
    this.stateChangeListeners.add(listener)
  }

  static createInitialState(): State {
    return {
      items: {
        0: {
          itemId: 0,
          itemType: ItemType.TEXT,
          childItemIds: List.of(1, 2, 5),
          parentItemIds: List.of(),
          isFolded: false,
          timestamp: 1604284090000,
          cssClasses: List.of(),
        },
        1: {
          itemId: 1,
          itemType: ItemType.TEXT,
          childItemIds: List.of(3, 6),
          parentItemIds: List.of(0),
          isFolded: false,
          timestamp: 1604284090001,
          cssClasses: List.of(),
        },
        2: {
          itemId: 2,
          itemType: ItemType.TEXT,
          childItemIds: List.of(4),
          parentItemIds: List.of(0),
          isFolded: true,
          timestamp: 1604284090002,
          cssClasses: List.of(),
        },
        3: {
          itemId: 3,
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parentItemIds: List.of(1),
          isFolded: false,
          timestamp: 1604284090003,
          cssClasses: List.of(),
        },
        4: {
          itemId: 4,
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parentItemIds: List.of(2),
          isFolded: false,
          timestamp: 1604284090004,
          cssClasses: List.of('grayed-out-item'),
        },
        5: {
          itemId: 5,
          itemType: ItemType.WEB_PAGE,
          childItemIds: List.of(),
          parentItemIds: List.of(0),
          isFolded: false,
          timestamp: 1604284090005,
          cssClasses: List.of(),
        },
        6: {
          itemId: 6,
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parentItemIds: List.of(1),
          isFolded: false,
          timestamp: 1604284090006,
          cssClasses: List.of(),
        },
      },
      textItems: {
        0: {
          domishObjects: List.of({type: 'text', textContent: 'Top'}),
        },
        1: {
          domishObjects: List.of({type: 'text', textContent: 'isFolded false'}),
        },
        2: {
          domishObjects: List.of({type: 'text', textContent: 'isFolded true'}),
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
      nextNewItemId: 7,
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
        '1000p': {functionName: 'togglePaged'},
        '1000o': {functionName: 'toggleBold'},
        '1000u': {functionName: 'toggleUnderline'},
        '1000i': {functionName: 'toggleItalic'},
        '1000k': {functionName: 'toggleStrikethrough'},
        '1000s': {functionName: 'openDataFolderDialog'},
        '0000F2': {functionName: 'edit'},
        '0110ArrowDown': {functionName: 'selectAllBelowItems'},
      },
      webPageItemTitleSettingDialog: null,
      treeifyWindowWidth: window.outerWidth,
      isFloatingLeftSidebarShown: false,
    }
  }
}
