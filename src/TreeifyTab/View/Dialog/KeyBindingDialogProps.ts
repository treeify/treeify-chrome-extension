import {List} from 'immutable'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {createKeyBindingProps, KeyBindingProps} from 'src/TreeifyTab/View/Dialog/KeyBindingProps'

export type KeyBindingDialogProps = {
  keyBindingPropses: List<KeyBindingProps>
}

export function createKeyBindingDialogProps(): KeyBindingDialogProps {
  const bindings = Object.entries(Internal.instance.state.mainAreaKeyBindings)

  return {
    keyBindingPropses: List(bindings).map(createKeyBindingProps),
  }
}
