import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {getTextItemSelectionFromDom} from 'src/TreeifyWindow/External/domTextSelection'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {DomishObject} from 'src/TreeifyWindow/Internal/DomishObject'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'
import {get} from 'svelte/store'

export type ItemTreeTextContentViewModel = {
  itemPath: ItemPath
  itemType: ItemType.TEXT
  labels: List<string>
  domishObjects: List<DomishObject>
  onInput: (event: Event) => void
  onCompositionEnd: (event: CompositionEvent) => void
  onClick: (event: Event) => void
}

export function createItemTreeTextContentViewModel(
  state: State,
  itemPath: ItemPath
): ItemTreeTextContentViewModel {
  const itemId = ItemPath.getItemId(itemPath)
  return {
    itemPath,
    labels: CurrentState.getLabels(itemPath),
    itemType: ItemType.TEXT,
    domishObjects: get(state.textItems[itemId].domishObjects),
    onInput: (event: Event) => {
      doWithErrorCapture(() => {
        if (event instanceof InputEvent && !event.isComposing && event.target instanceof Node) {
          Rerenderer.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

          // contenteditableな要素のinnerHTMLをModelに反映する
          const domishObjects = DomishObject.fromChildren(event.target)
          CurrentState.setTextItemDomishObjects(itemId, domishObjects)

          CurrentState.updateItemTimestamp(itemId)
          Rerenderer.instance.rerender()
        }
      })
    },
    onCompositionEnd: (event) => {
      doWithErrorCapture(() => {
        if (event.target instanceof Node) {
          // contenteditableな要素のinnerHTMLをModelに反映する
          const domishObjects = DomishObject.fromChildren(event.target)
          CurrentState.setTextItemDomishObjects(itemId, domishObjects)
          Rerenderer.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
          CurrentState.updateItemTimestamp(itemId)

          // 本当はCurrentState.commit()を呼んでリアクティブに画面を更新したいのだが、
          // 呼ぶと解決の難しい不具合が起こるので呼んでいない。
          //
          // 【不具合の詳細】
          // 具体的には、IMEで文字を入力してからTabキーやSpaceキーで変換モードにした後、
          // Enterキーを押さずに後続の文字を打ち始めると、打鍵が1回分なかったことになる。
          // 例えばAキー、Iキー、Spaceキー、Gキー、Aキーという順に打鍵したとすると、
          // 「愛が」になるのが正しいが、Gキーの打鍵がなかったことになり「愛あ」になる。
          //
          // 【CurrentState.commit()を呼ばないことによる悪影響】
          // 編集中のテキストアイテムがページツリー内に表示されていたり、
          // トランスクルードされてアイテムツリー内に表示されている場合、
          // IME入力を完了してもそれらのViewに最新のテキストが反映されない。
          // Viewに反映されないだけでModel(State)には反映されているので、次回の描画時に正しい表示になる。
        }
      })
    },
    onClick: (event) => {
      doWithErrorCapture(() => {
        CurrentState.setTargetItemPath(itemPath)

        // 再描画によってDOM要素が再生成され、キャレット位置がリセットされるので上書きするよう設定する
        Rerenderer.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

        Rerenderer.instance.rerender()
      })
    },
  }
}
