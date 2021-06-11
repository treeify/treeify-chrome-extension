<script context="module" lang="ts">
  import {List} from 'immutable'
  import {get} from 'svelte/store'
  import {doWithErrorCapture} from '../../errorCapture'
  import {getTextItemSelectionFromDom} from '../../External/domTextSelection'
  import {External} from '../../External/External'
  import {CurrentState} from '../../Internal/CurrentState'
  import {DomishObject} from '../../Internal/DomishObject'
  import {Internal} from '../../Internal/Internal'
  import {ItemPath} from '../../Internal/ItemPath'
  import Label from '../Label.svelte'
  import {ItemTreeContentView} from './ItemTreeContentView'

  export function createItemTreeTextContentProps(itemPath: ItemPath) {
    const itemId = ItemPath.getItemId(itemPath)
    return {
      itemPath,
      labels: CurrentState.getLabels(itemPath),
      innerHtml: get(Internal.instance.state.textItems[itemId].innerHtml),
      onInput: (event: InputEvent) => {
        doWithErrorCapture(() => {
          if (!event.isComposing && event.target instanceof Node) {
            External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

            // contenteditableな要素のinnerHTMLをModelに反映する
            const innerHtml = DomishObject.fromChildren(event.target)
            CurrentState.setTextItemDomishObjects(itemId, innerHtml)

            CurrentState.updateItemTimestamp(itemId)
            CurrentState.commit()
          }
        })
      },
      onCompositionEnd: (event: CompositionEvent) => {
        doWithErrorCapture(() => {
          if (event.target instanceof Node) {
            // contenteditableな要素のinnerHTMLをModelに反映する
            const innerHtml = DomishObject.fromChildren(event.target)
            CurrentState.setTextItemDomishObjects(itemId, innerHtml)
            External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())
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
      onClick: (event: MouseEvent) => {
        doWithErrorCapture(() => {
          CurrentState.setTargetItemPath(itemPath)

          // 再描画によってDOM要素が再生成され、キャレット位置がリセットされるので上書きするよう設定する
          External.instance.requestSelectAfterRendering(getTextItemSelectionFromDom())

          CurrentState.commit()
        })
      },
    }
  }
</script>

<script lang="ts">
  export let itemPath: ItemPath
  export let labels: List<string>
  export let innerHtml: string
  export let onInput: (event: InputEvent) => void
  export let onCompositionEnd: (event: CompositionEvent) => void
  export let onClick: (event: MouseEvent) => void

  const id = ItemTreeContentView.focusableDomElementId(itemPath)
</script>

<div class="item-tree-text-content">
  {#if !labels.isEmpty()}
    <div class="item-tree-text-content_labels">
      {#each labels.toArray() as label}
        <Label text={label} />
      {/each}
    </div>
  {/if}
  <div
    class="item-tree-text-content_content-editable"
    {id}
    contenteditable="true"
    on:input={onInput}
    on:compositionend={onCompositionEnd}
    on:click={onClick}
  >
    {@html innerHtml}
  </div>
</div>

<style>
  .item-tree-text-content_labels {
    float: left;

    /* テキストとの間に少し余白を入れないとくっつく */
    margin-right: 0.1em;
  }

  /* テキストアイテムのcontenteditableな要素 */
  .item-tree-text-content_content-editable {
    /* contenteditableな要素のフォーカス時の枠線を非表示 */
    outline: 0 solid transparent;
  }

  /* グレーアウト状態のテキストアイテム */
  :global(.grayed-out) .item-tree-text-content_content-editable,
  :global(.grayed-out-children) .item-tree-text-content_content-editable {
    color: var(--grayed-out-item-text-color);
  }
</style>
