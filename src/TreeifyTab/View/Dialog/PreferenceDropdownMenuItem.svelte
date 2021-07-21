<script lang="ts">
  import {List} from 'immutable'
  import {doWithErrorCapture} from '../../errorCapture'
  import {External} from '../../External/External'
  import {InputId} from '../../Internal/InputId'
  import {Rerenderer} from '../../Rerenderer'
  import {PreferenceDropdownMenuItemProps} from './PreferenceDropdownMenuItemProps'

  export let props: PreferenceDropdownMenuItemProps

  function onClick() {
    doWithErrorCapture(() => {
      External.instance.dialogState = undefined
      props.onClick()
      Rerenderer.instance.rerender()
    })
  }

  function onKeyDown(event: KeyboardEvent) {
    doWithErrorCapture(() => {
      const inputId = InputId.fromKeyboardEvent(event)
      if (inputId === '0000ArrowDown') {
        // フォーカスを次の要素に移す
        const focusableElements = List(
          document.querySelectorAll('.preference-dropdown-menu-item')
        ) as List<HTMLElement>
        const index = focusableElements.findIndex((element) => document.activeElement === element)
        if (index === -1) return

        const nextIndex = (index + 1) % focusableElements.size
        focusableElements.get(nextIndex)!.focus()
      } else if (inputId === '0000ArrowUp') {
        // フォーカスを前の要素に移す
        const focusableElements = List(
          document.querySelectorAll('.preference-dropdown-menu-item')
        ) as List<HTMLElement>
        const index = focusableElements.findIndex((element) => document.activeElement === element)
        if (index === -1) return

        const prevIndex = (index - 1) % focusableElements.size
        focusableElements.get(prevIndex)!.focus()
      } else if (inputId === '0000Enter' || inputId === '0000Space') {
        event.preventDefault()
        onClick()
      }
    })
  }
</script>

<div class="preference-dropdown-menu-item" tabindex="0" on:click={onClick} on:keydown={onKeyDown}>
  {props.title}
</div>

<style global>
  .preference-dropdown-menu-item {
    outline: 0 solid transparent;

    font-size: 13px;
    padding: 0.1em 0.5em;

    cursor: pointer;
  }

  .preference-dropdown-menu-item:focus {
    /* lch(93.0%, 7.8, 280.4)相当 */
    background: #e7ebfa;
  }

  .preference-dropdown-menu-item:hover {
    /* lch(95.5%, 3.6, 280.4)相当 */
    background: #f0f2f9;
  }
</style>
