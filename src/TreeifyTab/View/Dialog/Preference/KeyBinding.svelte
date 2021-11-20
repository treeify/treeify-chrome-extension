<script lang="ts">
  import { InputId } from 'src/TreeifyTab/Internal/InputId.js'
  import { commandNames } from 'src/TreeifyTab/View/commandNames.js'
  import { KeyBindingProps } from 'src/TreeifyTab/View/Dialog/Preference/KeyBindingProps'

  export let props: KeyBindingProps
</script>

<tr class="key-binding_binding-row">
  <td class="key-binding_input-id">{InputId.toReadableText(props.inputId)}</td>
  <td class="key-binding_commands">
    {#each props.commandIds.toArray() as selectedCommandId, index}
      <div class="key-binding_command-row">
        <select data-index={index} on:change={props.onChange}>
          {#each props.commandGroups.toArray() as commandGroup}
            <optgroup label={commandGroup.name}>
              {#each commandGroup.commandIds.toArray() as commandId}
                <option value={commandId} selected={selectedCommandId === commandId}
                  >{commandNames[commandId]}</option
                >
              {/each}
            </optgroup>
          {/each}
        </select>
        <div
          class="delete-button icon-button"
          data-index={index}
          tabindex="-1"
          on:click={props.onClickDeleteButton}
        />
        <div
          class="add-command-button icon-button"
          data-index={index}
          tabindex="-1"
          on:click={props.onClickAddCommandButton}
        />
      </div>
    {/each}
  </td>
</tr>

<style global lang="scss">
  :root {
    --key-binding-dialog-command-button-size: 1.5em;
    --key-binding-dialog-delete-icon-size: 1.2em;
    --key-binding-dialog-add-icon-size: var(--key-binding-dialog-delete-icon-size);
  }

  .key-binding_input-id {
    text-align: right;
    padding-left: 3em;
  }

  .key-binding_commands {
    padding-block: 0.3em;
  }

  .key-binding_command-row {
    display: flex;
    align-items: center;

    padding-left: 2em;
  }

  .delete-button {
    width: var(--key-binding-dialog-command-button-size);
    aspect-ratio: 1;

    // マウスホバー時にのみ表示
    visibility: hidden;

    &::before {
      content: '';

      width: var(--key-binding-dialog-delete-icon-size);
      aspect-ratio: 1;

      // 中央寄せ
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      // lch(40.0%, 0.0, 0.0)相当
      background: #5e5e5e;
      -webkit-mask: url('./trash-can-icon.svg') no-repeat center;
      -webkit-mask-size: contain;
    }

    .key-binding_command-row:hover & {
      visibility: visible;
    }
  }

  .add-command-button {
    width: var(--key-binding-dialog-command-button-size);
    aspect-ratio: 1;

    // マウスホバー時にのみ表示
    visibility: hidden;

    &::before {
      content: '';

      width: var(--key-binding-dialog-add-icon-size);
      aspect-ratio: 1;

      // 中央寄せ
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      // lch(40.0%, 0.0, 0.0)相当
      background: #5e5e5e;
      -webkit-mask: url('./plus-icon.svg') no-repeat center;
      -webkit-mask-size: contain;
    }

    .key-binding_command-row:hover & {
      visibility: visible;
    }
  }
</style>
