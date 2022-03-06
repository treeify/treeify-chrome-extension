<script lang="ts">
  import { TOP_ITEM_ID } from 'src/TreeifyTab/basicType'
  import { External } from 'src/TreeifyTab/External/External'
  import { toOpmlString } from 'src/TreeifyTab/Internal/ImportExport/opml'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { State } from 'src/TreeifyTab/Internal/State'
  import ItemAdditionButton from 'src/TreeifyTab/View/Toolbar/ItemAdditionButton.svelte'
  import PreferenceButton from 'src/TreeifyTab/View/Toolbar/PreferenceButton.svelte'
  import SyncButton from 'src/TreeifyTab/View/Toolbar/SyncButton.svelte'
  import { ToolbarProps } from 'src/TreeifyTab/View/Toolbar/ToolbarProps'
  import { assert } from 'src/Utility/Debug/assert'

  export let props: ToolbarProps

  function onClickOpmlExport() {
    const fileName = 'treeify.opml'

    const content = toOpmlString([[TOP_ITEM_ID]])
    const aElement = document.createElement('a')
    aElement.href = window.URL.createObjectURL(new Blob([content], { type: 'application/xml' }))
    aElement.download = fileName
    aElement.click()

    assert(Array.from(External.instance.urlToItemIdsForTabCreation.values()).flat().length === 0)
    assert(External.instance.tabIdsToBeClosedForUnloading.size === 0)
    assert(State.isValid(Internal.instance.state))
  }

  function onClickStateValidation() {
    assert(Array.from(External.instance.urlToItemIdsForTabCreation.values()).flat().length === 0)
    assert(External.instance.tabIdsToBeClosedForUnloading.size === 0)
    assert(State.isValid(Internal.instance.state))
  }
</script>

<div class="toolbar_root">
  {#if process.env.NODE_ENV !== 'production'}
    <button on:mousedown|preventDefault={onClickOpmlExport}>OPMLエクスポート</button>
    <button on:mousedown|preventDefault={onClickStateValidation}>バリデーション</button>
  {/if}
  <SyncButton props={props.syncButtonProps} />
  <ItemAdditionButton />
  <PreferenceButton />
</div>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .toolbar_root {
    height: 40px;
    padding-inline: common.em(2);

    // ボタンなどを横に並べる（右寄せ）
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;

    // 左サイドバーにも影が落ちるように左サイドバーより高くする
    position: relative;
    z-index: 20;

    background: lch(100% 0 0);
    box-shadow: 0 0 3px lch(70% 0 0);

    @media print {
      display: none;
    }
  }
</style>
