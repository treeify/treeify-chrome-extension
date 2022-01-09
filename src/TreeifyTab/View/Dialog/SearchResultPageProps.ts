import { List } from 'immutable'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import {
  createSearchResultItemPropses,
  SearchResultItemProps,
} from 'src/TreeifyTab/View/Dialog/SearchResultItemProps'
import {
  createItemContentProps,
  ItemContentProps,
} from 'src/TreeifyTab/View/ItemContent/ItemContentProps'
import { RArray$ } from 'src/Utility/fp-ts'

export type SearchResultPageProps = {
  pageContent: ItemContentProps
  searchResultItemPropses: RArray$.T<SearchResultItemProps>
}

export function createSearchResultPageProps(itemPaths: List<ItemPath>) {
  return {
    pageContent: createItemContentProps(ItemPath.getRootItemId(itemPaths.first())),
    searchResultItemPropses: createSearchResultItemPropses(itemPaths),
  }
}
