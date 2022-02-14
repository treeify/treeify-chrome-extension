<script lang="ts">
  import dayjs from 'dayjs'
  import { External } from 'src/TreeifyTab/External/External'
  import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
  import { Reminder } from 'src/TreeifyTab/Internal/State'
  import { StatePath } from 'src/TreeifyTab/Internal/StatePath'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import CommonDialog from 'src/TreeifyTab/View/Dialog/CommonDialog.svelte'
  import FinishAndCancelButtons from 'src/TreeifyTab/View/Dialog/FinishAndCancelButtons.svelte'

  const targetItemId = ItemPath.getItemId(CurrentState.getTargetItemPath())
  const reminder = Internal.instance.state.reminders[targetItemId]

  let reminderType: Reminder['type'] = reminder?.type ?? 'once'

  // TODO: リマインダーが設定済みならその値を初期値として設定する
  let pickedDate = dayjs().format('YYYY-MM-DD')
  let time = '00:00'

  let date = reminder?.date?.toString() ?? dayjs().date()

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
    switch (reminderType) {
      case 'once': {
        const parsed = dayjs(`${pickedDate} ${time}`)
        if (!parsed.isValid()) {
          alert('日時の形式が不正です。')
          return
        }

        Internal.instance.saveCurrentStateToUndoStack()
        const reminder: Reminder = {
          type: 'once',
          year: parsed.year(),
          month: parsed.month(),
          date: parsed.date(),
          hour: parsed.hour(),
          minute: parsed.minute(),
        }
        Internal.instance.mutate(reminder, StatePath.of('reminders', targetItemId))

        break
      }
      case 'every month':
        const [hour, minute] = time.split(':').map(Number)
        Internal.instance.saveCurrentStateToUndoStack()
        const reminder: Reminder = {
          type: 'every month',
          date,
          hour,
          minute,
        }
        Internal.instance.mutate(reminder, StatePath.of('reminders', targetItemId))
        break
    }
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
    <select bind:value={reminderType} class="reminder-setting-dialog_select">
      <option value="once">繰り返さない</option>
      <option value="every month">毎月</option>
    </select>
    {#if reminderType === 'once'}
      <input type="date" class="reminder-setting-dialog_date-picker" bind:value={pickedDate} />
      <input type="time" class="reminder-setting-dialog_time" bind:value={time} />
    {:else if reminderType === 'every month'}
      <input
        type="number"
        class="reminder-setting-dialog_date"
        min="1"
        max="31"
        bind:value={date}
      />
      日
      <input type="time" class="reminder-setting-dialog_time" bind:value={time} />
    {/if}
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
