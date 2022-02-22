<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { allLanguages } from 'src/TreeifyTab/highlightJs'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import PrimaryAndSecondaryButtons from 'src/TreeifyTab/View/Dialog/PrimaryAndSecondaryButtons.svelte'

  const itemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const codeBlockItem = Internal.instance.state.codeBlockItems[itemId]
  let languageValue = ''

  function onClickPrimaryButton() {
    // 言語自動検出の精度アップのためスコア補正値を計算・保存
    const languageScoreOffsets = Internal.instance.state.languageScoreOffsets
    const amount = 1
    Internal.instance.mutate(
      (languageScoreOffsets[languageValue] ?? 0) + amount,
      StatePath.of('languageScoreOffsets', languageValue)
    )
    Internal.instance.mutate(
      (languageScoreOffsets[codeBlockItem.language] ?? 0) - amount,
      StatePath.of('languageScoreOffsets', codeBlockItem.language)
    )

    CurrentState.setCodeBlockItemLanguage(itemId, languageValue)
    CurrentState.updateItemTimestamp(itemId)

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickSecondaryButton() {
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
        onClickPrimaryButton()
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
        <option class="code-block-language-setting-dialog_language-option" value={language} />
      {/each}
    </datalist>
    <div class="code-block-language-setting-dialog_bottom-button-area">
      <PrimaryAndSecondaryButtons {onClickPrimaryButton} {onClickSecondaryButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  .code-block-language-setting-dialog_content {
    padding: 1em;
  }

  .code-block-language-setting-dialog_bottom-button-area {
    @include common.flex-right;

    margin-top: 1em;
  }
</style>
