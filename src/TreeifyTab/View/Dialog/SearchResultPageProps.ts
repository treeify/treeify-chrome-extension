import {List} from 'immutable'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {
  createSearchResultItemPropses,
  SearchResultItemProps,
} from 'src/TreeifyTab/View/Dialog/SearchResultItemProps'

export type SearchResultPageProps = {
  searchResultItemPropses: List<SearchResultItemProps>
}

export function createSearchResultPageProps(itemPaths: List<ItemPath>) {
  return {
    searchResultItemPropses: createSearchResultItemPropses(itemPaths),
  }
}
