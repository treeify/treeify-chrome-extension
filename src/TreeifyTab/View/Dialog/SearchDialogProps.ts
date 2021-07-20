import {List} from 'immutable'
import {SearchDialog} from 'src/TreeifyTab/External/DialogState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'

export type SearchDialogProps = {
  onKeyDown: (event: KeyboardEvent) => void
}

export function createSearchDialogProps(dialog: SearchDialog): SearchDialogProps {
  return {onKeyDown}
}

function onKeyDown(event: KeyboardEvent) {
  if (event.isComposing) return

  const inputId = InputId.fromKeyboardEvent(event)
  switch (inputId) {
    case '0000ArrowDown':
    case '0000ArrowUp':
      event.preventDefault()

      const focusableElements = List(
        document.querySelectorAll('.search-dialog_content input, .search-dialog_content [tabindex]')
      ) as List<HTMLElement>
      const index = focusableElements.findIndex((element) => document.activeElement === element)
      if (index === -1) return

      if (inputId === '0000ArrowDown') {
        // フォーカスを次の要素に移す
        const nextIndex = (index + 1) % focusableElements.size
        focusableElements.get(nextIndex)!.focus()
      } else {
        // フォーカスを前の要素に移す
        const prevIndex = (index - 1) % focusableElements.size
        focusableElements.get(prevIndex)!.focus()
      }
      break
  }
}
