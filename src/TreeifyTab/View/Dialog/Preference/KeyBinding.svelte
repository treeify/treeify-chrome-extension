<script lang="ts">
  import {assertNonUndefined} from '../../../../Common/Debug/assert'
  import {Internal} from '../../../Internal/Internal'
  import {PropertyPath} from '../../../Internal/PropertyPath'
  import {Rerenderer} from '../../../Rerenderer'
  import {commandNames} from '../../commandNames'
  import {KeyBindingProps} from './KeyBindingProps'

  export let props: KeyBindingProps

  function onChange(event: Event) {
    if (event.target instanceof HTMLSelectElement) {
      // コマンドリストの何番目が変更されたかを取得する
      assertNonUndefined(event.target.dataset.index)
      const index = parseInt(event.target.dataset.index)

      const oldCommandIds = Internal.instance.state.mainAreaKeyBindings[props.inputId]
      const newCommandIds = oldCommandIds.set(index, event.target.value)
      Internal.instance.mutate(newCommandIds, PropertyPath.of('mainAreaKeyBindings', props.inputId))
    }
  }

  function onClickDeleteButton(event: Event) {
    if (event.target instanceof HTMLElement) {
      // コマンドリストの何番目のボタンが押下されたかを取得する
      assertNonUndefined(event.target.dataset.index)
      const index = parseInt(event.target.dataset.index)

      const oldCommandIds = Internal.instance.state.mainAreaKeyBindings[props.inputId]
      const newCommandIds = oldCommandIds.remove(index)
      Internal.instance.mutate(newCommandIds, PropertyPath.of('mainAreaKeyBindings', props.inputId))
      Rerenderer.instance.rerender()
    }
  }
</script>

<div>{props.inputId}</div>
<div>
  {#each props.commandIds.toArray() as selectedCommandId, index}
    <div class="key-binding_command-row">
      <select data-index={index} on:change={onChange}>
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
      <div class="delete-button icon-button" data-index={index} on:click={onClickDeleteButton} />
    </div>
  {/each}
</div>

<style global>
  :root {
    --key-binding-dialog-delete-button-size: 1.5em;
    --key-binding-dialog-delete-icon-size: 1.1em;
  }

  .key-binding_command-row {
    display: flex;
    align-items: center;
  }

  .delete-button {
    width: var(--key-binding-dialog-delete-button-size);
    height: var(--key-binding-dialog-delete-button-size);

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
</style>
