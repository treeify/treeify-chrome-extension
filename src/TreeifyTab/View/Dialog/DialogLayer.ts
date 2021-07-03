import {Dialog, State} from 'src/TreeifyTab/Internal/State'

export type DialogLayerProps = {
  dialog: Dialog | undefined
}

export function createDialogLayerProps(state: State): DialogLayerProps {
  return {
    dialog: state.dialog ?? undefined,
  }
}
