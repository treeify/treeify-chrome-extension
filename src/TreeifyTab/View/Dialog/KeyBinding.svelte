<script lang="ts">
  import {Command} from '../../Internal/Command'
  import {KeyBindingProps} from './KeyBindingProps'

  export let props: KeyBindingProps

  const commandIds = Object.keys(Command)
</script>

<div>{props.inputId}</div>
<div>
  {#each props.commandIds.toArray() as selectedCommandId}
    <div>
      <select>
        {#each commandIds as commandId}
          <option value={commandId} selected={selectedCommandId === commandId}>{commandId}</option>
        {/each}
      </select>
    </div>
  {/each}
</div>

<style global>
</style>
