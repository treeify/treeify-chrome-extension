<script lang="ts">
  import {allLanguages} from 'src/TreeifyTab/highlightJs.js'
  import {CodeBlockLanguageSettingDialogProps} from './CodeBlockLanguageSettingDialogProps'
  import CommonDialog from './CommonDialog.svelte'
  import FinishAndCancelButtons from './FinishAndCancelButtons.svelte'

  export let props: CodeBlockLanguageSettingDialogProps
</script>

<CommonDialog title="コードブロック言語設定">
  <div class="language-setting-dialog_content">
    <input
      type="text"
      class="language-setting-dialog_language"
      list="language-setting-dialog_language-list"
      placeholder={props.language}
    />
    <datalist id="language-setting-dialog_language-list">
      {#each allLanguages.toArray() as language}
        <option value={language} />
      {/each}
    </datalist>
    <div class="language-setting-dialog_button-area">
      <FinishAndCancelButtons
        onClickFinishButton={props.onClickFinishButton}
        onClickCancelButton={props.onClickCancelButton}
      />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .language-setting-dialog_content {
    padding: 1em;
  }

  .language-setting-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
