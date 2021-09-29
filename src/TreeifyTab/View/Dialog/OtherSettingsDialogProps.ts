import {OtherSettingsDialog} from 'src/TreeifyTab/External/DialogState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'

export type OtherSettingsDialogProps = {
  leftEndMouseGestureEnabled: boolean
  onChangeLeftEndMouseGestureEnabled: (event: Event) => void
}

export function createOtherSettingsDialogProps(
  dialog: OtherSettingsDialog
): OtherSettingsDialogProps {
  return {
    leftEndMouseGestureEnabled: Internal.instance.state.leftEndMouseGestureEnabled,
    onChangeLeftEndMouseGestureEnabled(event) {
      if (event.target instanceof HTMLInputElement) {
        Internal.instance.mutate(
          event.target.checked,
          PropertyPath.of('leftEndMouseGestureEnabled')
        )
      }
    },
  }
}
