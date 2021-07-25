<script lang="ts">
  import {commandNames} from '../../commandNames'
  import {KeyBindingProps} from './KeyBindingProps'

  export let props: KeyBindingProps
</script>

<div>{props.inputId}</div>
<div>
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
        on:click={props.onClickDeleteButton}
      />
      <div
        class="add-command-button icon-button"
        data-index={index}
        on:click={props.onClickAddCommandButton}
      />
    </div>
  {/each}
</div>

<style global>
  :root {
    --key-binding-dialog-command-button-size: 1.5em;
    --key-binding-dialog-delete-icon-size: 1.2em;
    --key-binding-dialog-add-icon-size: var(--key-binding-dialog-delete-icon-size);
  }

  .key-binding_command-row {
    display: flex;
    align-items: center;
  }

  .delete-button {
    width: var(--key-binding-dialog-command-button-size);
    height: var(--key-binding-dialog-command-button-size);

    /* マウスホバー時にのみ表示 */
    visibility: hidden;
  }
  .delete-button::before {
    content: '';

    width: var(--key-binding-dialog-delete-icon-size);
    height: var(--key-binding-dialog-delete-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* lch(40.0%, 0.0, 0.0)相当 */
    background: #5e5e5e;
    -webkit-mask: url('./trash-can-icon.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
  .key-binding_command-row:hover .delete-button {
    visibility: visible;
  }

  .add-command-button {
    width: var(--key-binding-dialog-command-button-size);
    height: var(--key-binding-dialog-command-button-size);

    /* マウスホバー時にのみ表示 */
    visibility: hidden;
  }
  .add-command-button::before {
    content: '';

    width: var(--key-binding-dialog-add-icon-size);
    height: var(--key-binding-dialog-add-icon-size);

    /* 中央寄せ */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    /* lch(40.0%, 0.0, 0.0)相当 */
    background: #5e5e5e;
    -webkit-mask: url('./plus-icon2.svg') no-repeat center;
    -webkit-mask-size: contain;
  }
  .key-binding_command-row:hover .add-command-button {
    visibility: visible;
  }
</style>
