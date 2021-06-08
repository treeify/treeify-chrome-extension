import {doAsyncWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {classMap, createDivElement} from 'src/TreeifyWindow/View/createElement'

export type DataFolderPickerOpenButtonViewModel = {
  isGrayedOut: boolean
}

export function createDataFolderPickerOpenButtonViewModel(): DataFolderPickerOpenButtonViewModel {
  return {
    isGrayedOut:
      External.instance.dataFolder !== undefined &&
      External.instance.pendingMutatedChunkIds.size === 0,
  }
}

export function DataFolderPickerOpenButtonView(viewModel: DataFolderPickerOpenButtonViewModel) {
  return createDivElement('toolbar-icon-button', {click: onClick}, [
    createDivElement(
      classMap({
        'data-folder-picker-open-button_icon': true,
        'grayed-out': viewModel.isGrayedOut,
      })
    ),
  ])
}

function onClick() {
  doAsyncWithErrorCapture(async () => {
    await NullaryCommand.saveToDataFolder()
    CurrentState.commit()
  })
}
