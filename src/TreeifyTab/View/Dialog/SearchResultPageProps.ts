import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
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
  isTranscluded: boolean
  searchResultItemPropses: RArray<SearchResultItemProps>
}

export function createSearchResultPageProps(itemPaths: RArray<ItemPath>): SearchResultPageProps {
  const pageId = ItemPath.getRootItemId(itemPaths[0])
  return {
    pageContent: createItemContentProps(pageId),
    isTranscluded: CurrentState.countParents(pageId) > 1,
    searchResultItemPropses: createSearchResultItemPropses(itemPaths),
  }
}
