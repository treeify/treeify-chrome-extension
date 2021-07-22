<script lang="ts">
  import CodeBlockItemCreationButton from './CodeBlockItemCreationButton.svelte'
  import DataFolderPickerOpenButton from './DataFolderPickerOpenButton.svelte'
  import ImportButton from './ImportButton.svelte'
  import PreferenceButton from './PreferenceButton.svelte'
  import TexItemCreationButton from './TexItemCreationButton.svelte'
  import {ToolbarProps} from './ToolbarProps'

  export let props: ToolbarProps
</script>

<div class="toolbar">
  <DataFolderPickerOpenButton props={props.dataFolderPickerOpenButtonProps} />
  <CodeBlockItemCreationButton />
  <TexItemCreationButton />
  <ImportButton />
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
