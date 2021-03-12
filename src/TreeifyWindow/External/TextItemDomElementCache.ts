import {List} from 'immutable'
import {DomishObject} from 'src/Common/DomishObject'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'

/** テキストアイテムのcontenteditableな要素のキャッシュ */
export class TextItemDomElementCache {
  private readonly textItemDomElementCache = new Map<string, [List<DomishObject>, HTMLElement]>()

  /**
   * キャッシュされたDOM要素を返す。
   * もし該当データがない、または再利用条件を満たしていなければundefinedを返す。
   *
   * 【再利用条件】
   * アイテムパスとDomishObjectsの両方とも一致しているときに再利用する。
   * もしアイテムパスの一致だけで再利用してしまうと、ユーザー操作以外（Undoなど）でDomishObjectsが変化した際に
   * DOM内容が変化しないままになってしまう。
   * 逆に、もしDomishObjectsの一致だけで再利用してしまうと同じ内容のテキストアイテム間でDOM要素が共有されてしまう。
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
}
