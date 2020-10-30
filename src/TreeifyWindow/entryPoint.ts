import {List} from 'immutable'
import {render} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {createItemTreeRootViewModel} from 'src/TreeifyWindow/Model/createViewModel'
import {State} from 'src/TreeifyWindow/Model/State'
import {ItemTreeRootView} from 'src/TreeifyWindow/View/ItemTreeRootView'

// テスト用のState
const state: State = {
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
      childItemIds: List.of(),
      parentItemIds: List.of(0),
      isFolded: false,
    },
    3: {
      itemId: 3,
      itemType: ItemType.TEXT,
      childItemIds: List.of(),
      parentItemIds: List.of(1),
      isFolded: false,
    },
  },
  textItems: {
    0: {
      itemId: 0,
      domishObjects: List.of({
        type: 'text',
        textContent: 'Top',
      }),
    },
    1: {
      itemId: 1,
      domishObjects: List.of({
        type: 'text',
        textContent: 'a1',
      }),
    },
    2: {
      itemId: 2,
      domishObjects: List.of({
        type: 'text',
        textContent: 'a2',
      }),
    },
    3: {
      itemId: 3,
      domishObjects: List.of({
        type: 'text',
        textContent: 'a3',
      }),
    },
  },
  nextNewItemId: 4,
  activePageId: 0,
}

const spaRoot = document.getElementById('spa-root')!
render(ItemTreeRootView(createItemTreeRootViewModel(state)), spaRoot)
