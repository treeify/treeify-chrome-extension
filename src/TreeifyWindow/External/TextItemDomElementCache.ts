import {List} from 'immutable'
import {DomishObject} from 'src/Common/DomishObject'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {assertNonUndefined} from 'src/Common/Debug/assert'

/** テキストアイテムのcontenteditableな要素のキャッシュ */
export class TextItemDomElementCache {
  private readonly textItemDomElementCache = new Map<string, [List<DomishObject>, HTMLElement]>()

  /**
   * キャッシュされたDOM要素を返す。
   * もし該当データがない、または再利用条件を満たしていなければundefinedを返す。
   *
   * 【再利用条件】
   * アイテムパスとdomishObjectsの両方とも一致しているときに再利用する。
   * もしアイテムパスの一致だけで再利用してしまうと、ユーザーによる直接編集以外（Undoなど）でdomishObjectsが変化した際に
   * DOM内容が変化しないままになってしまう。
   * 逆に、もしdomishObjectsの一致だけで再利用してしまうと同じ内容のテキストアイテム間でDOM要素が共有されてしまう。
   */
  get(itemPath: ItemPath, domishObjects: List<DomishObject>): HTMLElement | undefined {
    const cacheEntry = this.textItemDomElementCache.get(itemPath.toString())
    if (cacheEntry !== undefined && DomishObject.equals(cacheEntry[0], domishObjects)) {
      return cacheEntry[1]
    }
    return undefined
  }

  /** DOM要素をキャッシュに登録する */
  set(itemPath: ItemPath, domishObjects: List<DomishObject>, contentEditableElement: HTMLElement) {
    this.textItemDomElementCache.set(itemPath.toString(), [domishObjects, contentEditableElement])
  }

  /** キャッシュ内のdomishObjectsを更新する */
  updateDomishObjects(itemPath: ItemPath, domishObjects: List<DomishObject>) {
    const cacheEntry = this.textItemDomElementCache.get(itemPath.toString())
    assertNonUndefined(cacheEntry)

    this.textItemDomElementCache.set(itemPath.toString(), [domishObjects, cacheEntry[1]])
  }
}
