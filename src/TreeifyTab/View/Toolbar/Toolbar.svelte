<script lang="ts">
  import {List} from 'immutable'
  import {assert} from '../../../Common/Debug/assert'
  import {TOP_ITEM_ID} from '../../basicType'
  import {doWithErrorCapture} from '../../errorCapture'
  import {toOpmlString} from '../../Internal/ImportExport/opml'
  import {Internal} from '../../Internal/Internal'
  import {State} from '../../Internal/State'
  import CodeBlockItemCreationButton from './CodeBlockItemCreationButton.svelte'
  import DataFolderPickerOpenButton from './DataFolderPickerOpenButton.svelte'
  import TexItemCreationButton from './TexItemCreationButton.svelte'
  import {ToolbarProps} from './ToolbarProps'

  export let props: ToolbarProps

  function onClickExportButton() {
    doWithErrorCapture(() => {
      const fileName = 'treeify.opml'

      const content = toOpmlString(List.of(List.of(TOP_ITEM_ID)))
      const aElement = document.createElement('a')
      aElement.href = window.URL.createObjectURL(new Blob([content], {type: 'application/xml'}))
      aElement.download = fileName
      aElement.click()

      assert(State.isValid(Internal.instance.state))
    })
  }
</script>

<div class="toolbar">
  <!-- TODO: このボタンはここではなく設定画面の中にあるべき -->
  <button on:click={onClickExportButton}>OPMLファイルをエクスポート</button>
  <CodeBlockItemCreationButton />
  <TexItemCreationButton />
  <DataFolderPickerOpenButton props={props.dataFolderPickerOpenButtonProps} />
</div>

<style>
  :root {
    /* ツールバーの高さ */
    --toolbar-height: 36px;
    /* ツールバーの背景。lch(96.0%, 0.0, 0.0)相当 */
    --toolbar-background: #f3f3f3;
  }

  .toolbar {
    /* ボタンなどを横に並べる */
    display: flex;
    align-items: center;
    justify-content: flex-end;

    /* 左サイドバーにも影が落ちるように左サイドバーより高くする */
    position: relative;
    z-index: 20;

    height: var(--toolbar-height);

    background: var(--toolbar-background);
    /* Dynalistを参考にして作った影。lch(85.0%, 0.0, 0.0)相当 */
    box-shadow: 0 1.5px 3px #d4d4d4;
  }
</style>
