import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import {
  createSearchResultItemPropses,
  SearchResultItemProps,
} from 'src/TreeifyTab/View/Dialog/SearchResultItemProps'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { RArray } from 'src/Utility/fp-ts'

export type SearchResultPageProps = {
  pageContent: ItemContentProps
  searchResultItemPropses: RArray<SearchResultItemProps>
}

export function createSearchResultPageProps(itemPaths: RArray<ItemPath>) {
  return {
    pageContent: createItemContentProps(ItemPath.getRootItemId(itemPaths[0])),
    searchResultItemPropses: createSearchResultItemPropses(itemPaths),
  }
}
