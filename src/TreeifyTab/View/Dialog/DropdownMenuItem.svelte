<script lang="ts">
  import { List } from 'immutable'
  import { doWithErrorCapture } from 'src/TreeifyTab/errorCapture'
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { DropdownMenuItemProps } from 'src/TreeifyTab/View/Dialog/DropdownMenuItemProps'

  export let props: DropdownMenuItemProps

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
          document.querySelectorAll('.dropdown-menu-item')
        ) as List<HTMLElement>
        const index = focusableElements.findIndex((element) => document.activeElement === element)
        if (index === -1) return

        const nextIndex = (index + 1) % focusableElements.size
        focusableElements.get(nextIndex)!.focus()
      } else if (inputId === '0000ArrowUp') {
        // フォーカスを前の要素に移す
        const focusableElements = List(
          document.querySelectorAll('.dropdown-menu-item')
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

  function onMouseEnter(event: MouseEvent) {
    if (event.target instanceof HTMLElement) {
      event.target.focus()
    }
  }
</script>

<div
  class="dropdown-menu-item"
  tabindex="0"
  on:click={onClick}
  on:mouseenter={onMouseEnter}
  on:keydown={onKeyDown}
>
  {props.title}
</div>

<style global lang="scss">
  .dropdown-menu-item {
    outline: none;

    font-size: 0.9rem;
    padding: 0.1em 0.5em;

    cursor: pointer;

    &:focus {
      // lch(93.0%, 7.8, 280.4)相当
      background: #e7ebfa;
    }
  }
</style>
