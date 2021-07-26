<script lang="ts">
  import {assert} from '../../../Common/Debug/assert'
  import {CurrentState} from '../../Internal/CurrentState'
  import {toOpmlString} from '../../Internal/ImportExport/opml'
  import {Internal} from '../../Internal/Internal'
  import {State} from '../../Internal/State'
  import DataFolderPickerOpenButton from './DataFolderPickerOpenButton.svelte'
  import AddButton from './ItemAdditionButton.svelte'
  import PreferenceButton from './PreferenceButton.svelte'
  import {ToolbarProps} from './ToolbarProps'

  export let props: ToolbarProps

  function onClick() {
    const fileName = 'treeify.opml'

    const content = toOpmlString(CurrentState.getSelectedItemPaths())
    const aElement = document.createElement('a')
    aElement.href = window.URL.createObjectURL(new Blob([content], {type: 'application/xml'}))
    aElement.download = fileName
    aElement.click()

    assert(State.isValid(Internal.instance.state))
  }
</script>

<div class="toolbar">
  <button on:click={onClick}>OPMLエクスポート</button>
  <DataFolderPickerOpenButton props={props.dataFolderPickerOpenButtonProps} />
  <AddButton />
  <!--  <CodeBlockItemCreationButton />-->
  <!--  <TexItemCreationButton />-->
  <!--  <ImportButton />-->
  <PreferenceButton />
</div>

<style global>
  :root {
    /* ツールバーの高さ */
    --toolbar-height: 36px;
    /* ツールバーの背景。lch(96.0%, 0.0, 0.0)相当 */
    --toolbar-background: #f3f3f3;
  }

  .toolbar {
    height: var(--toolbar-height);
    padding-inline: 2em;

    /* ボタンなどを横に並べる（右寄せ） */
    display: flex;
    align-items: center;
    justify-content: flex-end;

    /* 左サイドバーにも影が落ちるように左サイドバーより高くする */
    position: relative;
    z-index: 20;

    background: var(--toolbar-background);
    /* Dynalistを参考にして作った影。lch(85.0%, 0.0, 0.0)相当 */
    box-shadow: 0 1.5px 3px #d4d4d4;
  }
</style>
