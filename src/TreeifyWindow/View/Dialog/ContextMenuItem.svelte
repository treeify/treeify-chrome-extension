<script lang="ts">
  import {List} from 'immutable'
  import {CurrentState} from '../../Internal/CurrentState'
  import {InputId} from '../../Internal/InputId'
  import {Rerenderer} from '../../Rerenderer'
  import {ContextMenuItemProps} from './ContextMenuItemProps'

  export let props: ContextMenuItemProps

  function onClick() {
    // props.onClick()より先にダイアログを閉じる必要がある。
    // なぜならprops.onClick()内でダイアログを表示する場合があり、
    // その後にダイアログを閉じると何も起こらなくなってしまうから。
    CurrentState.setDialog(null)
    props.onClick()

    Rerenderer.instance.rerender()
  }

  function onKeyDown(event: KeyboardEvent) {
    const inputId = InputId.fromKeyboardEvent(event)
    if (inputId === "0000ArrowDown") {
      // フォーカスを次の要素に移す
      const focusableElements = List(document.querySelectorAll('.context-menu-item')) as List<HTMLElement>
      const index = focusableElements.findIndex(element => document.activeElement === element)
      if (index === -1) return
      
      const nextIndex = (index + 1) % focusableElements.size
      focusableElements.get(nextIndex)!.focus()
    } else if (inputId === "0000ArrowUp") {
      // フォーカスを前の要素に移す
      const focusableElements = List(document.querySelectorAll('.context-menu-item')) as List<HTMLElement>
      const index = focusableElements.findIndex(element => document.activeElement === element)
      if (index === -1) return

      const prevIndex = (index - 1) % focusableElements.size
      focusableElements.get(prevIndex)!.focus()
    } else if (inputId === "0000Enter" || inputId === "0000Space") {
      if (event.target instanceof HTMLElement) {
        event.target.click()
      }
    }
  }
</script>

<div class="context-menu-item" tabindex="0" on:click={onClick} on:keydown={onKeyDown}>{props.title}</div>

<style>
  .context-menu-item {
    outline: 0 solid transparent;

    font-size: 13px;

    cursor: pointer;
  }

  .context-menu-item:focus {
    background: hsl(240, 100%, 96%);
  }

  .context-menu-item:hover {
    background: hsl(240, 100%, 96%);
  }
</style>
