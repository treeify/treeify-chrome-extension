<script lang="ts">
  import { List } from 'immutable'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from '../CommonDialog.svelte'
  import KeyBinding from './KeyBinding.svelte'
  import { KeyBindingDialogProps } from './KeyBindingDialogProps'

  export let props: KeyBindingDialogProps

  let isAddBindingMode = false

  $: style = `visibility: ${isAddBindingMode ? 'visible' : 'hidden'};`

  function onClick() {
    isAddBindingMode = true
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!isAddBindingMode) return

    event.preventDefault()
    event.stopPropagation()
    if (List.of('Control', 'Shift', 'Alt', 'Meta').contains(event.key)) return

    const inputId = InputId.fromKeyboardEvent(event)
    if (Internal.instance.state.mainAreaKeyBindings[inputId] !== undefined) {
      // TODO: 該当キーバインドが既にある旨のメッセージを表示する
      return
    }

    isAddBindingMode = false

    Internal.instance.mutate(List.of('doNothing'), PropertyPath.of('mainAreaKeyBindings', inputId))
    Rerenderer.instance.rerender()
  }
</script>

<CommonDialog title="キーボード操作設定" showCloseButton>
  <div class="key-binding-dialog_content" on:keydown={onKeyDown}>
    <table class="key-binding-dialog_table">
      {#each props.keyBindingPropses.toArray() as keyBindingProps (keyBindingProps.inputId)}
        <KeyBinding props={keyBindingProps} />
      {/each}
      <tr class="key-binding-dialog_add-binding-button-row">
        <td class="key-binding-dialog_add-binding-button-cell">
          <button class="key-binding-dialog_add-binding-button" on:click={onClick}
            >新しい割り当てを追加
          </button>
        </td>
        <td />
      </tr>
    </table>
    <p class="key-binding-dialog_message-for-add-binding" {style}>
      コマンドを割り当てたいキーをそのまま入力してください。<br />
      （例：Shift+Alt+F）
    </p>
  </div>
</CommonDialog>

<style global lang="scss">
  .key-binding-dialog_content {
    padding: 1em;
  }

  .key-binding-dialog_table {
    border-collapse: collapse;

    tr:nth-child(odd) {
      // lch(96.0%, 0.0, 0.0)相当
      background: #f3f3f3;
    }
  }

  .key-binding-dialog_add-binding-button {
    margin-left: auto;
    display: block;
  }

  .key-binding-dialog_message-for-add-binding {
    margin-inline: auto;
    width: max-content;
  }
</style>
