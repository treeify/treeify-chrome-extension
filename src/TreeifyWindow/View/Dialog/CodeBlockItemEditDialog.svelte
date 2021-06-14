<script context="module" lang="ts">
  import hljs from 'highlight.js'
  import {State} from 'src/TreeifyWindow/Internal/State'
  import {assertNonNull} from '../../../Common/Debug/assert'
  import {CurrentState} from '../../Internal/CurrentState'
  import {ItemPath} from '../../Internal/ItemPath'
  import CommonDialog from './CommonDialog.svelte'

  export function createCodeBlockItemEditDialogProps(
    codeBlockItemEditDialog: State.CodeBlockItemEditDialog
  ) {
    const targetItemPath = CurrentState.getTargetItemPath()
    return {
      ...codeBlockItemEditDialog,
      onClickFinishButton: () => {
        const targetItemId = ItemPath.getItemId(targetItemPath)

        // コードを更新
        const textarea = document.querySelector<HTMLTextAreaElement>('.code-block-edit-dialog_code')
        assertNonNull(textarea)
        CurrentState.setCodeBlockItemCode(targetItemId, textarea.value)

        // 言語を更新
        const input = document.querySelector<HTMLInputElement>('.code-block-edit-dialog_language')
        assertNonNull(input)
        CurrentState.setCodeBlockItemLanguage(targetItemId, input.value)

        // タイムスタンプを更新
        CurrentState.updateItemTimestamp(targetItemId)

        // ダイアログを閉じる
        CurrentState.setCodeBlockItemEditDialog(null)
        CurrentState.commit()
      },
      onClickCancelButton: () => {
        // ダイアログを閉じる
        CurrentState.setCodeBlockItemEditDialog(null)
        CurrentState.commit()
      },
    }
  }
</script>

<script lang="ts">
  export let code: string
  export let language: string
  export let onClickFinishButton: () => void
  export let onClickCancelButton: () => void

  const onCloseDialog = () => {
    // ダイアログを閉じる
    CurrentState.setCodeBlockItemEditDialog(null)
    CurrentState.commit()
  }
</script>

<CommonDialog title="コードブロック編集" {onCloseDialog}>
  <div class="code-block-edit-dialog_content">
    <textarea class="code-block-edit-dialog_code">{code}</textarea>
    <div class="code-block-edit-dialog_language-area">
      <label>言語名</label>
      <input
        class="code-block-edit-dialog_language"
        type="text"
        autocomplete="on"
        list="languages"
        value={language}
      />
    </div>
    <datalist id="languages">
      {#each hljs.listLanguages() as language}
        <option value={language} />
      {/each}
    </datalist>
    <div class="code-block-edit-dialog_button-area">
      <button on:click={onClickFinishButton}>完了</button>
      <button on:click={onClickCancelButton}>キャンセル</button>
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
