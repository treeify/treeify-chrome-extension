<script lang="ts">
  import { External } from 'src/TreeifyTab/External/External'
  import { InputId } from 'src/TreeifyTab/Internal/InputId'
  import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
  import { DropdownMenuItemProps } from 'src/TreeifyTab/View/Dialog/DropdownMenuItemProps'

  export let props: DropdownMenuItemProps

  function onClick() {
    External.instance.dialogState = undefined
    props.onClick()
    Rerenderer.instance.rerender()
  }

  function onKeyDown(event: KeyboardEvent) {
    const inputId = InputId.fromKeyboardEvent(event)
    if (inputId === '0000ArrowDown') {
      // フォーカスを次の要素に移す
      const focusableElements = Array.from(
        document.querySelectorAll<HTMLElement>('.dropdown-menu-item_root')
      )
      const index = focusableElements.findIndex((element) => document.activeElement === element)
      if (index === -1) return

      const nextIndex = (index + 1) % focusableElements.length
      focusableElements[nextIndex].focus()
    } else if (inputId === '0000ArrowUp') {
      // フォーカスを前の要素に移す
      const focusableElements = Array.from(
        document.querySelectorAll<HTMLElement>('.dropdown-menu-item_root')
      )
      const index = focusableElements.findIndex((element) => document.activeElement === element)
      if (index === -1) return

      const prevIndex = (index - 1 + focusableElements.length) % focusableElements.length
      focusableElements[prevIndex].focus()
    } else if (inputId === '0000Enter' || inputId === '0000Space') {
      event.preventDefault()
      onClick()
    }
  }

  function onMouseEnter(event: MouseEvent) {
    if (event.target instanceof HTMLElement) {
      event.target.focus()
    }
  }
</script>

<div
  class="dropdown-menu-item_root"
  tabindex="0"
  on:mousedown|preventDefault={onClick}
  on:mouseenter={onMouseEnter}
  on:keydown={onKeyDown}
>
  {props.title}
</div>

<style global lang="scss">
  .dropdown-menu-item_root {
    outline: none;

    font-size: 0.9rem;
    padding: 0.3em 0.5em;

    cursor: pointer;

    &:focus {
      background: var(--menu-item-hover-background-default-color);
    }
  }
</style>
