import {List} from 'immutable'
import {ItemType} from 'src/Common/basicType'
import {Batchizer} from 'src/TreeifyWindow/Internal/Batchizer'
import {Command} from 'src/TreeifyWindow/Internal/Command'
import {State} from 'src/TreeifyWindow/Internal/State'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'

/** TODO: コメント */
export class Internal {
  private static _instance: Internal | undefined

  private constructor() {}

  /** シングルトンインスタンスを取得する */
  static get instance(): Internal {
    if (this._instance === undefined) {
      this._instance = new Internal()
    }
    return this._instance
  }

  private readonly stateChangeListeners = new Set<(newState: State) => void>()

  readonly currentState: State = Internal.createInitialState()
  readonly nextState: Batchizer = new Batchizer(this.currentState)

  /** Stateへの変更を確定し、Viewに通知する */
  commit() {
    this.nextState.commit()
    for (const stateChangeListener of this.stateChangeListeners) {
      stateChangeListener(this.currentState)
    }
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
          url: 'https://ao-system.net/favicon/',
          faviconUrl: 'https://ao-system.net/favicon.ico',
          tabTitle: 'ファビコン作成 favicon.ico 無料で半透過マルチアイコンが作れます',
          title: null,
        },
      },
      pages: {
        '0': {
          targetItemPath: new ItemPath(List.of(0)),
        },
        '6': {
          targetItemPath: new ItemPath(List.of(6)),
        },
      },
      mountedPageIds: List.of(0),
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
        '1000s': new Command('openDatabaseFileDialog'),
      },
    }
  }
}
