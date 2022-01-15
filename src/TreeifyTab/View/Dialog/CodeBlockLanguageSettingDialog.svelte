<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { allLanguages } from 'src/TreeifyTab/highlightJs.js'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'

  const itemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
  let languageValue = ''

  function onClickFinishButton() {
    // 言語自動検出の精度アップのためスコア補正値を計算・保存
    const preferredLanguages = Internal.instance.state.preferredLanguages
    const amount = 1
    Internal.instance.mutate(
      (preferredLanguages[languageValue] ?? 0) + amount,
      StatePath.of('preferredLanguages', languageValue)
    )
    Internal.instance.mutate(
      (preferredLanguages[codeBlockItem.language] ?? 0) - amount,
      StatePath.of('preferredLanguages', codeBlockItem.language)
    )

    CurrentState.setCodeBlockItemLanguage(itemId, languageValue)
    CurrentState.updateItemTimestamp(itemId)

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickCancelButton() {
    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return

    switch (InputId.fromKeyboardEvent(event)) {
      case '0000Enter':
      case '1000Enter':
        event.preventDefault()
        onClickFinishButton()
        break
    }
  }
</script>

<CommonDialog class="code-block-language-setting-dialog_root" title="コードブロック言語設定">
  <div class="code-block-language-setting-dialog_content" on:keydown={onKeyDown}>
    <input
      type="text"
      class="code-block-language-setting-dialog_language"
      list="code-block-language-setting-dialog_language-list"
      placeholder={codeBlockItem.language}
      bind:value={languageValue}
    />
    <datalist id="code-block-language-setting-dialog_language-list">
      {#each allLanguages as language}
        <option value={language} />
      {/each}
    </datalist>
    <div class="code-block-language-setting-dialog_button-area">
      <FinishAndCancelButtons {onClickFinishButton} {onClickCancelButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .code-block-language-setting-dialog_content {
    padding: 1em;
  }

  .code-block-language-setting-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
