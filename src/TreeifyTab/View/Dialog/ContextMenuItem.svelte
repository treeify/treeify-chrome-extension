<script lang="ts">
  import { List } from 'immutable'
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Internal } from 'src/TreeifyTab/Internal/Internal'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { ContextMenuItemProps } from 'src/TreeifyTab/View/Dialog/ContextMenuItemProps'

  export let props: ContextMenuItemProps

  function onClick(event: MouseEvent) {
    event.preventDefault()
    Internal.instance.saveCurrentStateToUndoStack()

    // props.onClick()より先にダイアログを閉じる必要がある。
    // なぜならprops.onClick()内でダイアログを表示する場合があり、
    // その後にダイアログを閉じると何も起こらなくなってしまうから。
    External.instance.dialogState = undefined
    props.onClick()

    Rerenderer.instance.rerender()
  }

  function onKeyDown(event: KeyboardEvent) {
    const inputId = InputId.fromKeyboardEvent(event)
    if (inputId === '0000ArrowDown') {
      // フォーカスを次の要素に移す
      const focusableElements = List(
        document.querySelectorAll('.context-menu-item_root')
      ) as List<HTMLElement>
      const index = focusableElements.findIndex((element) => document.activeElement === element)
      if (index === -1) return

      const nextIndex = (index + 1) % focusableElements.size
      focusableElements.get(nextIndex)!.focus()
    } else if (inputId === '0000ArrowUp') {
      // フォーカスを前の要素に移す
      const focusableElements = List(
        document.querySelectorAll('.context-menu-item_root')
      ) as List<HTMLElement>
      const index = focusableElements.findIndex((element) => document.activeElement === element)
      if (index === -1) return

      const prevIndex = (index - 1) % focusableElements.size
      focusableElements.get(prevIndex)!.focus()
    } else if (inputId === '0000Enter' || inputId === '0000Space') {
      event.preventDefault()
      if (event.target instanceof HTMLElement) {
        event.target.click()
      }
    }
  }

  function onMouseEnter(event: MouseEvent) {
    if (event.target instanceof HTMLElement) {
      event.target.focus()
    }
  }
</script>

<div
  class="context-menu-item_root"
  tabindex="0"
  on:mousedown={onClick}
  on:mouseenter={onMouseEnter}
  on:keydown={onKeyDown}
>
  {props.title}
</div>

<style global lang="scss">
  .context-menu-item_root {
    outline: none;

    font-size: 0.9rem;
    padding: 0.1em 0.8em;

    cursor: pointer;

    &:focus {
      // lch(93.0%, 7.8, 280.4)相当
      background: #e7ebfa;
    }
  }
</style>
