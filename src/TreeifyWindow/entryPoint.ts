import {List} from 'immutable'
import {render} from 'lit-html'
import {ItemType} from 'src/Common/basicType'
import {ItemTreeRootView, ItemTreeRootViewModel} from 'src/TreeifyWindow/View/ItemTreeRootView'

// テスト用のViewModel
const itemTreeRootViewModel: ItemTreeRootViewModel = {
  rootNodeViewModel: {
    contentViewModel: {
      itemType: ItemType.TEXT,
      domishObjects: List.of({
        type: 'text',
        textContent: 'a1',
      }),
    },
    childItemViewModels: List.of(
      {
        contentViewModel: {
          itemType: ItemType.TEXT,
          domishObjects: List.of({
            type: 'text',
            textContent: 'a2',
          }),
        },
        childItemViewModels: List.of({
          contentViewModel: {
            itemType: ItemType.TEXT,
            domishObjects: List.of({
              type: 'text',
              textContent: 'a3',
            }),
          },
          childItemViewModels: List.of(),
        }),
      },
      {
        contentViewModel: {
          itemType: ItemType.TEXT,
          domishObjects: List.of({
            type: 'text',
            textContent: 'a4',
          }),
        },
        childItemViewModels: List.of(),
      }
    ),
  },
}

const spaRoot = document.getElementById('spa-root')!
const templateResult = ItemTreeRootView(itemTreeRootViewModel)
render(templateResult, spaRoot)
