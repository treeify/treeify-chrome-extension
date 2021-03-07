import {List} from 'immutable'
import {ItemId, ItemType} from 'src/Common/basicType'
import {Batchizer} from 'src/TreeifyWindow/Model/Batchizer'
import {Command} from 'src/TreeifyWindow/Model/Command'
import {State} from 'src/TreeifyWindow/Model/State'

export class Model {
  private static singletonInstance: Model

  private readonly stateChangeListeners = new Set<(newState: State) => void>()

  currentState: State
  nextState: Batchizer

  /** 既存のウェブページアイテムに対応するタブを開いた際、タブ作成イベントリスナーでアイテムIDと紐付けるためのMap */
  readonly urlToItemIdsForTabCreation = new Map<string, List<ItemId>>()

  private constructor() {
    this.currentState = Model.createInitialState()
    this.nextState = new Batchizer(this.currentState)
  }

  /** シングルトンインスタンスを取得する */
  static get instance(): Model {
    if (this.singletonInstance === undefined) {
      this.singletonInstance = new Model()
    }
    return this.singletonInstance
  }

  /** Stateへの変更を確定し、Viewに通知する */
  commit() {
    this.nextState.commit()
    for (const stateChangeListener of this.stateChangeListeners) {
      stateChangeListener(this.currentState)
    }
  }

  /**
   * Stateへの変更を確定する。Viewには通知しない。
   * このメソッドは状態を持つView内で起こった状態変化をModelに反映するために用いられる。
   */
  commitSilently() {
    this.nextState.commit()
  }

  addStateChangeListener(listener: (newState: State) => void) {
    this.stateChangeListeners.add(listener)
  }

  private static createInitialState(): State {
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
          itemId: 0,
          domishObjects: List.of({type: 'text', textContent: 'Top'}),
        },
        1: {
          itemId: 1,
          domishObjects: List.of({type: 'text', textContent: 'isFolded false'}),
        },
        2: {
          itemId: 2,
          domishObjects: List.of({type: 'text', textContent: 'isFolded true'}),
        },
        3: {
          itemId: 3,
          domishObjects: List.of({type: 'text', textContent: 'visible child'}),
        },
        4: {
          itemId: 4,
          domishObjects: List.of({type: 'text', textContent: 'invisible child'}),
        },
        6: {
          itemId: 6,
          domishObjects: List.of({type: 'text', textContent: '子ページ'}),
        },
      },
      webPageItems: {
        5: {
          itemId: 5,
          stableTabId: null,
          url: 'https://ao-system.net/favicon/',
          faviconUrl: 'https://ao-system.net/favicon.ico',
          tabTitle: 'ファビコン作成 favicon.ico 無料で半透過マルチアイコンが作れます',
          title: null,
        },
      },
      pages: {
        '0': {
          focusedItemPath: null,
          blurredItemPath: null,
        },
        '6': {
          focusedItemPath: null,
          blurredItemPath: null,
        },
      },
      mountedPages: {
        '0': {},
      },
      nextNewItemId: 7,
      activePageId: 0,
      itemTreeTextItemSelection: null,
      itemTreeInputBinding: {
        '0000Tab': new Command('indentItem'),
        '0100Tab': new Command('unindentItem'),
        '1000ArrowUp': new Command('moveItemUpward'),
        '1000ArrowDown': new Command('moveItemDownward'),
        '0000Enter': new Command('enterKeyDefault'),
        '0100Enter': new Command('insertLineBreak'),
        '1000Enter': new Command('toggleGrayedOut'),
        '1000d': new Command('deleteItem'),
        '1000p': new Command('togglePaged'),
      },
      stableTabs: {},
      stableTabIdToItemId: {},
    }
  }
}
