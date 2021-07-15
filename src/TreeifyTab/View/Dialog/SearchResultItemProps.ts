import {is, List} from 'immutable'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'

export type SearchResultItemProps = {
  itemPath: ItemPath
  children: List<SearchResultItemProps>
}

export function createSearchResultItemPropses(
  itemPaths: List<ItemPath>
): List<SearchResultItemProps> {
  const sortedItemPaths = CurrentState.sortByDocumentOrder(itemPaths)

  const topItemPath = sortedItemPaths.first(undefined)
  if (topItemPath === undefined) return List.of()

  const rootItemPaths = [topItemPath]
  const map = new Map<string, List<ItemPath>>()
  for (let i = 1; i < sortedItemPaths.size; i++) {
    const itemPath = sortedItemPaths.get(i)!

    for (let j = i - 1; ; j--) {
      if (j < 0) {
        rootItemPaths.push(itemPath)
        break
      }

      const candidateItemPath = sortedItemPaths.get(j)!
      // candidateItemPathがitemPathのprefixの場合
      if (is(itemPath.take(candidateItemPath.size), candidateItemPath)) {
        const key = JSON.stringify(candidateItemPath.toArray())
        map.set(key, (map.get(key) ?? List.of()).push(itemPath))
        break
      }
    }
  }

  return List(rootItemPaths).map((rootItemPath) => createSearchResultItemProps(rootItemPath, map))
}

function createSearchResultItemProps(
  itemPath: ItemPath,
  map: Map<string, List<ItemPath>>
): SearchResultItemProps {
  const key = JSON.stringify(itemPath.toArray())
  const childItemPaths = map.get(key) ?? List.of()
  return {
    itemPath,
    children: childItemPaths.map((childItemPath) =>
      createSearchResultItemProps(childItemPath, map)
    ),
  }
}
