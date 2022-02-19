<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { Command } from 'src/TreeifyTab/Internal/Command'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { commandNames } from 'src/TreeifyTab/View/commandNames'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'

  let commandIdValue = ''

  function onKeydown(event: KeyboardEvent) {
    if (event.isComposing) return

    switch (InputId.fromKeyboardEvent(event)) {
      case '0000Enter':
        event.preventDefault()
        doCommand(commandIdValue)
        break
    }
  }

  function doCommand(commandId: string) {
    // @ts-ignore
    const command = Command[commandId]
    if (typeof command === 'function') {
      Internal.instance.saveCurrentStateToUndoStack()
      External.instance.dialogState = undefined

      command()

      Rerenderer.instance.rerender()
    }
  }
</script>

<CommonDialog class="command-palette-dialog_root" title="コマンドパレット" showCloseButton>
  <div class="command-palette-dialog_content" on:keydown={onKeydown}>
    <input
      type="text"
      class="command-palette-dialog_command-id"
      list="command-palette-dialog_command-id-list"
      bind:value={commandIdValue}
    />
    <datalist id="command-palette-dialog_command-id-list">
      {#each Object.entries(commandNames) as [commandId, commandName]}
        <option class="command-palette-dialog_command-option" value={commandId}>
          {commandName}
        </option>
      {/each}
    </datalist>
  </div>
</CommonDialog>

<style lang="scss">
  .command-palette-dialog_content {
    padding: 1em;
  }
</style>
