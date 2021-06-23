<script lang="ts">
  import hljs from 'highlight.js'
  import {CurrentState} from '../../Internal/CurrentState'
  import {removeRedundantIndent} from '../../Internal/ImportExport/indentedText'
  import {Rerenderer} from '../../Rerenderer'
  import {CodeBlockItemEditDialogProps} from './CodeBlockItemEditDialogProps'
  import CommonDialog from './CommonDialog.svelte'

  export let props: CodeBlockItemEditDialogProps

  const onCloseDialog = () => {
    // ダイアログを閉じる
    CurrentState.setCodeBlockItemEditDialog(null)
    Rerenderer.instance.rerender()
  }

  function onPaste(event: ClipboardEvent) {
    if (event.clipboardData !== null && event.target instanceof HTMLDivElement) {
      event.preventDefault()

      const text = event.clipboardData.getData('text/plain')
      // 無駄なインデントを自動的に除去する機能
      event.target.textContent = removeRedundantIndent(text)
    }
  }
</script>

<CommonDialog title="コードブロック編集" {onCloseDialog}>
  <div class="code-block-edit-dialog_content">
    <div
      class="code-block-edit-dialog_code"
      contenteditable="plaintext-only"
      tabindex="0"
      on:paste={onPaste}
    >
      {props.code}
    </div>
    <div class="code-block-edit-dialog_language-area">
      <label>言語名</label>
      <input
        class="code-block-edit-dialog_language"
        type="text"
        autocomplete="on"
        list="languages"
        value={props.language}
      />
    </div>
    <datalist id="languages">
      {#each hljs.listLanguages() as language}
        <option value={language} />
      {/each}
    </datalist>
    <div class="code-block-edit-dialog_button-area">
      <button on:click={props.onClickFinishButton}>完了</button>
      <button on:click={props.onClickCancelButton}>キャンセル</button>
    </div>
  </div>
</CommonDialog>

<style>
  .code-block-edit-dialog_content {
    padding: 1em;
  }

  .code-block-edit-dialog_code {
    outline: 1px solid hsl(0, 0%, 60%);
  }

  .code-block-edit-dialog_language-area {
    display: flex;

    margin-top: 1em;
  }

  .code-block-edit-dialog_language {
    flex: 1 0;
  }

  .code-block-edit-dialog_button-area {
    /* ボタン群を右寄せにする */
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
