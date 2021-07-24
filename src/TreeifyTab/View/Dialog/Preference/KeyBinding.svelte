<script lang="ts">
  import {assertNonUndefined} from '../../../../Common/Debug/assert'
  import {Internal} from '../../../Internal/Internal'
  import {PropertyPath} from '../../../Internal/PropertyPath'
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
</script>

<div>{props.inputId}</div>
<div>
  {#each props.commandIds.toArray() as selectedCommandId, index}
    <div>
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
    </div>
  {/each}
</div>

<style global>
</style>
