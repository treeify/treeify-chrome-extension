<script lang="ts">
  import {CurrentState} from '../../Internal/CurrentState'
  import {CodeBlockItemEditDialog} from '../../Internal/State'
  import CommonDialog from './CommonDialog.svelte'

  export type CodeBlockItemEditDialogViewModel = CodeBlockItemEditDialog & {
    onClickFinishButton: () => void
    onClickCancelButton: () => void
  }

  export let viewModel: CodeBlockItemEditDialogViewModel

  const onCloseDialog = () => {
    // ダイアログを閉じる
    CurrentState.setCodeBlockItemEditDialog(null)
    CurrentState.commit()
  }
</script>

<CommonDialog title="コードブロック編集" {onCloseDialog}>
  <div class="code-block-edit-dialog_content">
    <textarea class="code-block-edit-dialog_code">{viewModel.code}</textarea>
    <div class="code-block-edit-dialog_language-area">
      <label>言語名</label>
      <input
        class="code-block-edit-dialog_language"
        type="text"
        autocomplete="on"
        list="languages"
        value={viewModel.language}
      />
    </div>
    <datalist id="languages">
      {#each hljs.listLanguages() as language}
        <option value={language} />
      {/each}
    </datalist>
    <div class="code-block-edit-dialog_button-area">
      <button on:click={viewModel.onClickFinishButton}>完了</button>
      <button on:click={viewModel.onClickCancelButton}>キャンセル</button>
    </div>
  </div>
</CommonDialog>

<style>
  .code-block-edit-dialog_content {
    width: 90vw;
    height: 50vh;

    /* ダイアログ内の基本レイアウトは縦並び */
    display: flex;
    flex-direction: column;
  }

  .code-block-edit-dialog_code {
    /* 表示範囲をタイトルバーやボタンエリアを除くダイアログ全域に広げる */
    flex: 1 0;

    margin: 1em;

    white-space: nowrap;

    resize: none;
  }

  .code-block-edit-dialog_language-area {
    display: flex;

    margin-left: 1em;
    margin-right: 1em;
  }

  .code-block-edit-dialog_language {
    flex: 1 0;
  }

  .code-block-edit-dialog_button-area {
    /* ボタン群を右寄せにする */
    margin: 1em 1em 1em auto;
  }
</style>
