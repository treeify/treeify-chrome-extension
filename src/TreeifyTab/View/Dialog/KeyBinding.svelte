<script lang="ts">
  import {Command} from '../../Internal/Command'
  import {Internal} from '../../Internal/Internal'
  import {PropertyPath} from '../../Internal/PropertyPath'
  import {KeyBindingProps} from './KeyBindingProps'

  export let props: KeyBindingProps

  function onChange(event: Event) {
    if (event.target instanceof HTMLSelectElement) {
      // コマンドリストの何番目が変更されたかを取得する
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
        {#each Object.keys(Command) as commandId}
          <option value={commandId} selected={selectedCommandId === commandId}>{commandId}</option>
        {/each}
      </select>
    </div>
  {/each}
</div>

<style global>
</style>
