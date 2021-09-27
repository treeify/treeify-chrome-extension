import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemId} from 'src/TreeifyTab/basicType'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type OtherParentsDialogItemProps = {
  itemId: ItemId
  onClick: () => void
}

export function createOtherParentsDialogItemProps(itemId: ItemId): OtherParentsDialogItemProps {
  return {
    itemId,
    onClick() {
      doWithErrorCapture(() => {
        const firstItemPath = List(CurrentState.yieldItemPaths(itemId)).first(undefined)
        assertNonUndefined(firstItemPath)
        CurrentState.jumpTo(firstItemPath)

        External.instance.dialogState = undefined
        Rerenderer.instance.rerender()
      })
    },
  }
}
