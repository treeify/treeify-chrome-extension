<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { CommandId, State } from 'src/TreeifyTab/Internal/State'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { commandNames } from 'src/TreeifyTab/View/commandNames'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import PrimaryAndSecondaryButtons from 'src/TreeifyTab/View/Dialog/PrimaryAndSecondaryButtons.svelte'
  import { RArray, RArray$ } from 'src/Utility/fp-ts'
  import { integer } from 'src/Utility/integer'
  import { tick } from 'svelte'

  let clonedKeyBindings = State.clone(Internal.instance.state.mainAreaKeyBindings)

  let isAddBindingMode = false

  function onClick() {
    isAddBindingMode = true
    tick().then(() => {
      const messageElement = document.querySelector<HTMLElement>(
        '.key-binding-dialog_message-for-add-binding'
      )
      if (messageElement !== null) {
        messageElement.scrollIntoView()
      }
    })
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!isAddBindingMode) return

    event.preventDefault()
    event.stopPropagation()
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) return

    const inputId = InputId.fromKeyboardEvent(event)
    if (clonedKeyBindings[inputId] !== undefined) {
      alert(`${InputId.toReadableText(inputId)} には既に割り当てられています。`)
      return
    }

    isAddBindingMode = false

    clonedKeyBindings[inputId] = ['doNothing']
  }

  function onClickPrimaryButton() {
    Internal.instance.mutate(clonedKeyBindings, StatePath.of('mainAreaKeyBindings'))
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickSecondaryButton() {
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onChange(event: Event, index: integer, inputId: InputId) {
    if (event.target instanceof HTMLSelectElement) {
      clonedKeyBindings[inputId] = RArray$.unsafeUpdateAt(
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
      clonedKeyBindings[inputId] = RArray$.unsafeDeleteAt(index, clonedKeyBindings[inputId])
    }
  }

  function onClickAddCommandButton(index: integer, inputId: InputId) {
    clonedKeyBindings[inputId] = RArray$.unsafeInsertAt<CommandId>(
      index + 1,
      'doNothing',
      clonedKeyBindings[inputId]
    )
  }

  // コマンド一覧をoptgroup要素でグルーピングするためのデータ
  const commandGroups: RArray<{ name: string; commandIds: RArray<CommandId> }> = [
    {
      name: '基本操作',
      commandIds: [
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
        'toggleFolded',
      ],
    },
    {
      name: 'テキスト項目操作',
      commandIds: [
        'insertNewline',
        'toggleBold',
        'toggleUnderline',
        'toggleItalic',
        'toggleStrikethrough',
      ],
    },
    {
      name: 'ウェブページ項目操作',
      commandIds: [
        'browseTab',
        'closeTreeTabs',
        'closeJustOneTab',
        'discardTreeTabs',
        'discardJustOneTab',
        'openTreeTabs',
        'openJustOneTab',
      ],
    },
    {
      name: 'ページ',
      commandIds: [
        'turnIntoPage',
        'turnIntoNonPage',
        'togglePaged',
        'switchPage',
        'addToPageTree',
        'removeFromPageTree',
      ],
    },
    {
      name: '項目装飾',
      commandIds: ['toggleCompleted', 'toggleHighlighted', 'toggleDoubtful', 'toggleSource'],
    },
    {
      name: '項目作成',
      commandIds: ['createImageItem', 'createCodeBlockItem', 'createTexItem', 'createTextItem'],
    },
    {
      name: 'クリップボード',
      commandIds: ['copyForTransclude', 'copyForMove', 'pasteAsPlainText'],
    },
    {
      name: 'ダイアログ表示',
      commandIds: [
        'showEditDialog',
        'showSearchDialog',
        'showReplaceDialog',
        'showSourceEditDialog',
        'showContextMenu',
        'showExportDialog',
        'showWorkspaceDialog',
        'showOtherParentsDialog',
        'showCommandPalette',
      ],
    },
    {
      name: '項目選択',
      commandIds: [
        'focusFirstSibling',
        'focusLastSibling',
        'selectToFirstSibling',
        'selectToLastSibling',
      ],
    },
    {
      name: 'その他',
      commandIds: ['doNothing', 'toggleExcluded'],
    },
  ]
</script>

<CommonDialog class="key-binding-dialog_root" title="キーボード操作設定">
  <div
    class="key-binding-dialog_content"
    style:--visibility={isAddBindingMode ? 'visible' : 'hidden'}
  >
    <div class="key-binding-dialog_scroll-area">
      <table class="key-binding-dialog_table">
        {#each Object.entries(clonedKeyBindings) as [inputId, commandIds] (inputId)}
          <tr class="key-binding_binding-row">
            <td class="key-binding-dialog_input-id">{InputId.toReadableText(inputId)}</td>
            <td class="key-binding-dialog_commands">
              {#each commandIds as selectedCommandId, index}
                <div class="key-binding-dialog_command-row">
                  <select
                    class="key-binding-dialog_command-select"
                    on:change={(event) => onChange(event, index, inputId)}
                  >
                    {#each commandGroups as commandGroup}
                      <optgroup
                        class="key-binding-dialog_command-option-group"
                        label={commandGroup.name}
                      >
                        {#each commandGroup.commandIds as commandId}
                          <option
                            class="key-binding-dialog_command-option"
                            value={commandId}
                            selected={selectedCommandId === commandId}
                          >
                            {commandNames[commandId]}
                          </option>
                        {/each}
                      </optgroup>
                    {/each}
                  </select>
                  <div
                    class="key-binding-dialog_delete-button"
                    tabindex="-1"
                    on:mousedown|preventDefault={() => onClickDeleteButton(index, inputId)}
                  />
                  <div
                    class="key-binding-dialog_add-command-button"
                    tabindex="-1"
                    on:mousedown|preventDefault={() => onClickAddCommandButton(index, inputId)}
                  />
                </div>
              {/each}
            </td>
          </tr>
        {/each}
      </table>
      <p class="key-binding-dialog_message-for-add-binding">
        コマンドを割り当てたいキーをそのまま入力してください。<br />
        （例：Ctrl+Shift+K）
      </p>
    </div>
    <div class="key-binding-dialog_bottom-button-area">
      <button class="key-binding-dialog_add-binding-button" on:mousedown|preventDefault={onClick}>
        新しい割り当てを追加
      </button>
      <PrimaryAndSecondaryButtons {onClickPrimaryButton} {onClickSecondaryButton} />
    </div>
  </div>
</CommonDialog>

<!-- イベントを拾うためのフォーカス管理が面倒なのでこうする -->
<svelte:body on:keydown={onKeyDown} />

<style global lang="scss">
  @use 'src/TreeifyTab/View/common.scss';

  :root {
    --key-binding-dialog-circle-button-size: #{common.toIntegerPx(1.6em)};
    --key-binding-dialog-circle-button-hover-color: oklch(88% 0 0);
  }

  .key-binding-dialog_content {
    padding: common.toIntegerPx(1em);

    max-height: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .key-binding-dialog_scroll-area {
    border: 1px solid oklch(80% 0 0);

    max-height: 100%;
    overflow-y: auto;

    // 横スクロールバーが表示される現象への対策
    overflow-x: hidden;
  }

  .key-binding-dialog_table {
    border-collapse: collapse;

    tr:nth-child(odd) {
      background: oklch(96% 0 0);
    }
  }

  .key-binding-dialog_input-id {
    text-align: right;
    padding-left: common.toIntegerPx(3em);
  }

  .key-binding-dialog_commands {
    padding-block: common.toIntegerPx(0.4em);
  }

  .key-binding-dialog_command-row {
    display: flex;
    align-items: center;

    padding-left: common.toIntegerPx(2em);
  }

  .key-binding-dialog_delete-button {
    @include common.circle(var(--key-binding-dialog-circle-button-size));
    @include common.pseudo-ripple-effect(var(--key-binding-dialog-circle-button-hover-color));

    // マウスホバー時にのみ表示
    visibility: hidden;

    &::before {
      content: '';

      @include common.size(common.toIntegerPx(1.2em));
      @include common.absolute-center;

      @include common.icon(oklch(40% 0 0), url('trash-can.svg'));
    }

    .key-binding-dialog_command-row:hover & {
      visibility: visible;
    }
  }

  .key-binding-dialog_add-command-button {
    @include common.circle(var(--key-binding-dialog-circle-button-size));
    @include common.pseudo-ripple-effect(var(--key-binding-dialog-circle-button-hover-color));

    // マウスホバー時にのみ表示
    visibility: hidden;

    &::before {
      content: '';

      @include common.size(common.toIntegerPx(1.2em));
      @include common.absolute-center;

      @include common.icon(oklch(40% 0 0), url('plus.svg'));
    }

    .key-binding-dialog_command-row:hover & {
      visibility: visible;
    }
  }

  .key-binding-dialog_message-for-add-binding {
    margin-inline: auto;
    width: max-content;

    visibility: var(--visibility);

    font-weight: bold;
  }

  .key-binding-dialog_bottom-button-area {
    display: flex;
    justify-content: space-between;

    margin-top: common.toIntegerPx(1em);
  }
</style>
