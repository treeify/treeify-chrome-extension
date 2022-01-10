<script lang="ts">
  import { pipe } from 'fp-ts/function'
  import { External } from 'src/TreeifyTab/External/External'
  import { autoDetectionLanguages, detectLanguage, LanguageScore } from 'src/TreeifyTab/highlightJs'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { removeRedundantIndent } from 'src/TreeifyTab/Internal/ImportExport/indentedText'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'
  import { Option$, RArray$, RSet$ } from 'src/Utility/fp-ts'

  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const isEmptyCodeBlockItem = CurrentState.isEmptyCodeBlockItem(targetItemId)
  const dialogTitle = isEmptyCodeBlockItem ? 'コードブロック項目作成' : 'コードブロック編集'
  let code = Internal.instance.state.codeBlockItems[targetItemId].code

  function onClickFinishButton() {
    // コードを更新
    CurrentState.setCodeBlockItemCode(targetItemId, code)
    // 言語を自動検出
    const preferredLanguages = Internal.instance.state.preferredLanguages
    const preferredLanguageNames = Object.keys(preferredLanguages)
    const preferredResults = preferredLanguageNames.map((language) => {
      const score =
        detectLanguage(code, RSet$.singleton(language)).score + preferredLanguages[language]
      return { language, score }
    })
    const originalResult = detectLanguage(
      code,
      RSet$.difference(autoDetectionLanguages, RSet$.from(preferredLanguageNames))
    )
    const language = pipe(
      preferredResults,
      RArray$.append(originalResult),
      RArray$.maxBy((object: LanguageScore) => object.score),
      Option$.map((object: LanguageScore) => object.language)
    )
    CurrentState.setCodeBlockItemLanguage(targetItemId, Option$.get('')(language))

    // タイムスタンプを更新
    CurrentState.updateItemTimestamp(targetItemId)

    onCloseDialog()

    // ダイアログを閉じる
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onPaste(event: ClipboardEvent) {
    if (event.clipboardData !== null) {
      event.preventDefault()

      // 無駄なインデントを自動的に除去する
      const text = removeRedundantIndent(event.clipboardData.getData('text/plain'))

      // 改行を含むテキストをそのままdocument.execCommand('insertText', false, text)としても
      // うまくいかないので改行をbr要素にする
      const lines = text.split(/\r?\n/)
      for (let i = 0; i < lines.length; i++) {
        document.execCommand('insertText', false, lines[i])
        if (i !== lines.length - 1) {
          document.execCommand('insertLineBreak')
        }
      }
    }
  }

  function onClickCancelButton() {
    // ダイアログを閉じる
    External.instance.dialogState = undefined
    onCloseDialog()
    Rerenderer.instance.rerender()
  }

  async function onKeyDown(event: KeyboardEvent) {
    switch (InputId.fromKeyboardEvent(event)) {
      case '1000Enter':
        event.preventDefault()
        onClickFinishButton()
        break
      case '1100KeyV':
        // インデント自動除去機能を回避する「そのまま貼り付け」機能
        event.preventDefault()
        const text = await navigator.clipboard.readText()
        document.execCommand('insertText', false, text)
    }
  }

  function onCloseDialog() {
    if (CurrentState.isEmptyCodeBlockItem(targetItemId)) {
      Command.removeItem()
    }
  }
</script>

<CommonDialog class="code-block-edit-dialog_root" title={dialogTitle} onClose={onCloseDialog}>
  <div class="code-block-edit-dialog_content" on:keydown={onKeyDown}>
    <div
      class="code-block-edit-dialog_code"
      contenteditable="plaintext-only"
      tabindex="0"
      bind:textContent={code}
      on:paste={onPaste}
    />
    <div class="code-block-edit-dialog_button-area">
      <FinishAndCancelButtons {onClickFinishButton} {onClickCancelButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .code-block-edit-dialog_content {
    min-width: 30em;
    padding: 1em;

    max-height: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .code-block-edit-dialog_code {
    min-height: 5em;
    padding: 0.5em;

    // lch(60.0%, 0.0, 0.0)相当
    outline: 1px solid #919191;

    overflow-y: auto;
  }

  .code-block-edit-dialog_button-area {
    // ボタン群を右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
