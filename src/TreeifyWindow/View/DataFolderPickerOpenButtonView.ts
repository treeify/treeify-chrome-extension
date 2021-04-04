import {html} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'

export type DataFolderPickerOpenButtonViewModel = {
  isGrayedOut: boolean
}

export function createDataFolderPickerOpenButtonViewModel(): DataFolderPickerOpenButtonViewModel {
  return {
    isGrayedOut:
      External.instance.dataFolder !== undefined &&
      External.instance.pendingMutatedPropertyPaths.size === 0,
  }
}

export function DataFolderPickerOpenButtonView(viewModel: DataFolderPickerOpenButtonViewModel) {
  return html`
    <div class="toolbar-icon-button" @click=${onClick}>
      <div
        class=${classMap({
          'data-folder-picker-open-button_icon': true,
          'grayed-out': viewModel.isGrayedOut,
        })}
      ></div>
    </div>
  `
}

function onClick() {
  NullaryCommand.saveToDataFolder()
  CurrentState.commit()
}
