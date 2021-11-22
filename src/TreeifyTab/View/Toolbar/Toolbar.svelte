<script lang="ts">
  import { List } from 'immutable'
  import { doWithErrorCapture } from 'src/TreeifyTab/errorCapture'
  import { toOpmlString } from 'src/TreeifyTab/Internal/ImportExport/opml'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { State } from 'src/TreeifyTab/Internal/State'
  import DataFolderButton from 'src/TreeifyTab/View/Toolbar/DataFolderButton.svelte'
  import ItemAdditionButton from 'src/TreeifyTab/View/Toolbar/ItemAdditionButton.svelte'
  import PreferenceButton from 'src/TreeifyTab/View/Toolbar/PreferenceButton.svelte'
  import { ToolbarProps } from 'src/TreeifyTab/View/Toolbar/ToolbarProps'
  import { assert } from 'src/Utility/Debug/assert'

  export let props: ToolbarProps

  function onClickOpmlExport() {
    const fileName = 'treeify.opml'

    const content = toOpmlString(List.of(List.of(0)))
    const aElement = document.createElement('a')
    aElement.href = window.URL.createObjectURL(new Blob([content], { type: 'application/xml' }))
    aElement.download = fileName
    aElement.click()

    assert(State.isValid(Internal.instance.state))
  }

  function onClickStateValidation() {
    doWithErrorCapture(() => {
      assert(State.isValid(Internal.instance.state))
    })
  }
</script>

<div class="toolbar">
  <button on:click={onClickOpmlExport}>OPMLエクスポート</button>
  <button on:click={onClickStateValidation}>Stateバリデーション</button>
  <DataFolderButton props={props.dataFolderButtonProps} />
  <ItemAdditionButton />
  <PreferenceButton />
</div>

<style global lang="scss">
  :root {
    // ツールバーの背景。lch(98.0%, 0.0, 0.0)相当
    --toolbar-background: #f9f9f9;
  }

  .toolbar {
    height: 36px;
    padding-inline: 2em;

    // ボタンなどを横に並べる（右寄せ）
    display: flex;
    align-items: center;
    justify-content: flex-end;

    // 左サイドバーにも影が落ちるように左サイドバーより高くする
    position: relative;
    z-index: 20;

    background: var(--toolbar-background);
    // Dynalistを参考にして作った影。lch(85.0%, 0.0, 0.0)相当
    box-shadow: 0 1.5px 3px #d4d4d4;

    @media print {
      display: none;
    }
  }
</style>
