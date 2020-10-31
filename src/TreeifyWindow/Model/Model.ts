import {List} from 'immutable'
import {ItemType} from 'src/Common/basicType'
import {State} from 'src/TreeifyWindow/Model/State'

export class Model {
  private static singletonInstance: Model

  currentState: State

  private constructor() {
    this.currentState = Model.createInitialState()
  }

  /** シングルトンインスタンスを取得する */
  static get instance(): Model {
    if (this.singletonInstance === undefined) {
      this.singletonInstance = new Model()
    }
    return this.singletonInstance
  }

  private static createInitialState(): State {
    return {
      items: {
        0: {
          itemId: 0,
          itemType: ItemType.TEXT,
          childItemIds: List.of(1, 2),
          parentItemIds: List.of(),
          isFolded: false,
        },
        1: {
          itemId: 1,
          itemType: ItemType.TEXT,
          childItemIds: List.of(3),
          parentItemIds: List.of(0),
          isFolded: false,
        },
        2: {
          itemId: 2,
          itemType: ItemType.TEXT,
          childItemIds: List.of(4),
          parentItemIds: List.of(0),
          isFolded: true,
        },
        3: {
          itemId: 3,
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parentItemIds: List.of(1),
          isFolded: false,
        },
        4: {
          itemId: 4,
          itemType: ItemType.TEXT,
          childItemIds: List.of(),
          parentItemIds: List.of(2),
          isFolded: false,
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
      },
      nextNewItemId: 5,
      activePageId: 0,
    }
  }
}
