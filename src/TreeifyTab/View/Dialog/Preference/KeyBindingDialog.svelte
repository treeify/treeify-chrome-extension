<script lang="ts">
  import { List } from 'immutable'
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
  import { CommandId, State } from 'src/TreeifyTab/Internal/State'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { commandNames } from 'src/TreeifyTab/View/commandNames.js'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'
  import { Rist } from 'src/Utility/fp-ts'
  import { integer } from 'src/Utility/integer'

  let clonedKeyBindings = State.clone(Internal.instance.state.mainAreaKeyBindings)

  let isAddBindingMode = false

  $: style = `--visibility: ${isAddBindingMode ? 'visible' : 'hidden'};`

  function onClick() {
    isAddBindingMode = true
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!isAddBindingMode) return

    event.preventDefault()
    event.stopPropagation()
    if (List.of('Control', 'Shift', 'Alt', 'Meta').contains(event.key)) return

    const inputId = InputId.fromKeyboardEvent(event)
    if (clonedKeyBindings[inputId] !== undefined) {
      alert(`${InputId.toReadableText(inputId)} には既に割り当てられています。`)
      return
    }

    isAddBindingMode = false

    clonedKeyBindings[inputId] = ['doNothing']
  }

  function onClickFinishButton() {
    Internal.instance.mutate(clonedKeyBindings, PropertyPath.of('mainAreaKeyBindings'))
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickCancelButton() {
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onChange(event: Event, index: integer, inputId: InputId) {
    if (event.target instanceof HTMLSelectElement) {
      clonedKeyBindings[inputId] = Rist.unsafeUpdateAt(
        index,
        event.target.value as CommandId,
        clonedKeyBindings[inputId]
      )
    }
  }

  function onClickDeleteButton(index: integer, inputId: InputId) {
    if (clonedKeyBindings[inputId].length === 1) {
      // 残り1個のコマンドを削除する際は、空リストにする代わりにバインディングそのものを削除する
      delete clonedKeyBindings[inputId]
      clonedKeyBindings = clonedKeyBindings
    } else {
      clonedKeyBindings[inputId] = Rist.unsafeDeleteAt(index, clonedKeyBindings[inputId])
    }
  }

  function onClickAddCommandButton(index: integer, inputId: InputId) {
    clonedKeyBindings[inputId] = Rist.unsafeInsertAt<CommandId>(
      index + 1,
      'doNothing',
      clonedKeyBindings[inputId]
    )
  }

  // コマンド一覧をoptgroup要素でグルーピングするためのデータ
  // コマンド一覧をoptgroup要素でグルーピングするためのデータ
  const commandGroups: Rist.T<{ name: string; commandIds: List<CommandId> }> = [
    {
      name: '基本操作',
      commandIds: List.of(
        'enterKeyDefault',
        'deleteItem',
        'removeItem',
        'deleteJustOneItem',
        'moveItemToAbove',
        'moveItemToBelow',
        'moveItemToPrevSibling',
        'moveItemToNextSibling',
        'indent',
        'unindent',
        'grouping',
        'fold',
        'unfold',
        'toggleFolded'
      ),
    },
    {
      name: 'テキスト項目操作',
      commandIds: List.of(
        'insertNewline',
        'toggleBold',
        'toggleUnderline',
        'toggleItalic',
        'toggleStrikethrough'
      ),
    },
    {
      name: 'ウェブページ項目操作',
      commandIds: List.of(
        'browseTab',
        'closeTreeTabs',
        'closeJustOneTab',
        'discardTreeTabs',
        'discardJustOneTab',
        'openTreeTabs',
        'openJustOneTab'
      ),
    },
    {
      name: 'ページ関連',
      commandIds: List.of('turnIntoPage', 'turnIntoNonPage', 'togglePaged', 'switchPage'),
    },
    {
      name: '項目装飾',
      commandIds: List.of('toggleCompleted', 'toggleHighlighted', 'toggleDoubtful', 'toggleSource'),
    },
    {
      name: '空の項目作成',
      commandIds: List.of(
        'createImageItem',
        'createCodeBlockItem',
        'createTexItem',
        'createTextItem'
      ),
    },
    {
      name: 'クリップボード',
      commandIds: List.of('copyForTransclude', 'copyForMove', 'pasteAsPlainText'),
    },
    {
      name: 'ダイアログ表示',
      commandIds: List.of(
        'showEditDialog',
        'showSearchDialog',
        'showReplaceDialog',
        'showSourceSettingDialog',
        'showContextMenuDialog',
        'showExportDialog',
        'showWorkspaceDialog',
        'showOtherParentsDialog',
        'showCommandPaletteDialog'
      ),
    },
    { name: '複数選択', commandIds: List.of('selectToStartOfList', 'selectToEndOfList') },
    {
      name: 'その他',
      commandIds: List.of(
        'doNothing',
        'syncTreeifyData',
        'toggleExcluded',
        'convertSpaceToNewline'
      ),
    },
  ]
</script>

<CommonDialog class="key-binding-dialog_root" title="キーボード操作設定">
  <div class="key-binding-dialog_content" {style} on:keydown={onKeyDown}>
    <div class="key-binding-dialog_scroll-area">
      <table class="key-binding-dialog_table">
        {#each Object.entries(clonedKeyBindings) as [inputId, commandIds] (inputId)}
          <tr class="key-binding_binding-row">
            <td class="key-binding-dialog_input-id">{InputId.toReadableText(inputId)}</td>
            <td class="key-binding-dialog_commands">
              {#each commandIds as selectedCommandId, index}
                <div class="key-binding-dialog_command-row">
                  <select on:change={(event) => onChange(event, index, inputId)}>
                    {#each commandGroups as commandGroup}
                      <optgroup label={commandGroup.name}>
                        {#each commandGroup.commandIds.toArray() as commandId}
                          <option value={commandId} selected={selectedCommandId === commandId}>
                            {commandNames[commandId]}
                          </option>
                        {/each}
                      </optgroup>
                    {/each}
                  </select>
                  <div
                    class="key-binding-dialog_delete-button"
                    tabindex="-1"
                    on:click={() => onClickDeleteButton(index, inputId)}
                  />
                  <div
                    class="key-binding-dialog_add-command-button"
                    tabindex="-1"
                    on:click={() => onClickAddCommandButton(index, inputId)}
                  />
                </div>
              {/each}
            </td>
          </tr>
        {/each}
        <tr class="key-binding-dialog_add-binding-button-row">
          <td class="key-binding-dialog_add-binding-button-cell">
            <button class="key-binding-dialog_add-binding-button" on:click={onClick}>
              新しい割り当てを追加
            </button>
          </td>
          <td />
        </tr>
      </table>
      <p class="key-binding-dialog_message-for-add-binding">
        コマンドを割り当てたいキーをそのまま入力してください。<br />
        （例：Ctrl+Shift+K）
      </p>
    </div>
    <div class="key-binding-dialog_button-area">
      <FinishAndCancelButtons {onClickFinishButton} {onClickCancelButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --key-binding-dialog-command-button-size: 1.5em;
    --key-binding-dialog-delete-icon-size: 1.2em;
    --key-binding-dialog-add-icon-size: var(--key-binding-dialog-delete-icon-size);
  }

  .key-binding-dialog_content {
    padding: 1em;

    max-height: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .key-binding-dialog_scroll-area {
    // lch(80.0%, 0.0, 0.0)相当
    border: 1px solid #c6c6c6;

    max-height: 100%;
    overflow-y: auto;

    // 横スクロールバーが表示される現象への対策
    overflow-x: hidden;
  }

  .key-binding-dialog_table {
    border-collapse: collapse;

    tr:nth-child(odd) {
      // lch(96.0%, 0.0, 0.0)相当
      background: #f3f3f3;
    }
  }

  .key-binding-dialog_input-id {
    text-align: right;
    padding-left: 3em;
  }

  .key-binding-dialog_commands {
    padding-block: 0.3em;
  }

  .key-binding-dialog_command-row {
    display: flex;
    align-items: center;

    padding-left: 2em;
  }

  .key-binding-dialog_delete-button {
    @include common.circle(var(--key-binding-dialog-command-button-size));
    // lch(90.0%, 0.0, 0.0)相当
    @include common.pseudo-ripple-effect(#e2e2e2);

    // マウスホバー時にのみ表示
    visibility: hidden;

    &::before {
      content: '';

      @include common.square(var(--key-binding-dialog-delete-icon-size));
      @include common.absolute-center;

      // lch(40.0%, 0.0, 0.0)相当
      @include common.icon(#5e5e5e, url('./trash-can.svg'));
    }

    .key-binding-dialog_command-row:hover & {
      visibility: visible;
    }
  }

  .key-binding-dialog_add-command-button {
    @include common.circle(var(--key-binding-dialog-command-button-size));
    // lch(90.0%, 0.0, 0.0)相当
    @include common.pseudo-ripple-effect(#e2e2e2);

    // マウスホバー時にのみ表示
    visibility: hidden;

    &::before {
      content: '';

      @include common.square(var(--key-binding-dialog-add-icon-size));
      @include common.absolute-center;

      // lch(40.0%, 0.0, 0.0)相当
      @include common.icon(#5e5e5e, url('./plus.svg'));
    }

    .key-binding-dialog_command-row:hover & {
      visibility: visible;
    }
  }

  .key-binding-dialog_add-binding-button {
    margin-left: auto;
    display: block;
  }

  .key-binding-dialog_message-for-add-binding {
    margin-inline: auto;
    width: max-content;

    visibility: var(--visibility);
  }

  .key-binding-dialog_button-area {
    // ボタンを右寄せにする
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
