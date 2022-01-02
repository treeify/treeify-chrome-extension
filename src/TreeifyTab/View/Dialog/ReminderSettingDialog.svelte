<script lang="ts">
  import dayjs from 'dayjs'
  import { ItemId } from 'src/TreeifyTab/basicType'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { PropertyPath } from 'src/TreeifyTab/Internal/PropertyPath'
  import { ReminderSetting, State } from 'src/TreeifyTab/Internal/State'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'
  import { Timestamp } from 'src/Utility/Timestamp'

  let date = dayjs().format('YYYY-MM-DD')
  let time = '00:00'

  function onKeydown(event: KeyboardEvent) {
    if (event.isComposing) return

    switch (InputId.fromKeyboardEvent(event)) {
      case '0000Enter':
      case '1000Enter':
        event.preventDefault()
        onClickFinishButton()
        break
    }
  }

  function onClickFinishButton() {
    const parsed = dayjs(`${date} ${time}`)
    if (!parsed.isValid()) return

    Internal.instance.saveCurrentStateToUndoStack()
    const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
    const reminderSetting: ReminderSetting = {
      type: 'once',
      year: parsed.year(),
      month: parsed.month(),
      date: parsed.date(),
      hour: parsed.hour(),
      minute: parsed.minute(),
    }
    const newReminderRecord: State['reminders'][ItemId] = { [Timestamp.now()]: reminderSetting }
    Internal.instance.mutate(newReminderRecord, PropertyPath.of('reminders', targetItemId))

    CurrentState.setupAllAlarms()

    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }

  function onClickCancelButton() {
    External.instance.dialogState = undefined
    Rerenderer.instance.rerender()
  }
</script>

<CommonDialog class="reminder-setting-dialog_root" title="リマインダー設定">
  <div class="reminder-setting-dialog_content" on:keydown={onKeydown}>
    <input type="date" bind:value={date} />
    <input type="time" bind:value={time} />
    <div class="reminder-setting-dialog_button-area">
      <FinishAndCancelButtons {onClickFinishButton} {onClickCancelButton} />
    </div>
  </div>
</CommonDialog>

<style global lang="scss">
  .reminder-setting-dialog_content {
    padding: 1em;
  }

  .reminder-setting-dialog_button-area {
    margin: 1em 0 0 auto;
    width: max-content;
  }
</style>
