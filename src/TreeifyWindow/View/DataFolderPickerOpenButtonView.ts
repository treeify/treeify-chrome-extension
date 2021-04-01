import {html} from 'lit-html'
import {classMap} from 'lit-html/directives/class-map'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'

export type DataFolderPickerOpenButtonViewModel = {
  hasDataFolderAlreadyOpened: boolean
}

export function createDataFolderPickerOpenButtonViewModel(): DataFolderPickerOpenButtonViewModel {
  return {
    hasDataFolderAlreadyOpened: External.instance.dataFolder !== undefined,
  }
}

export function DataFolderPickerOpenButtonView(viewModel: DataFolderPickerOpenButtonViewModel) {
  return html`
    <div class="toolbar-icon-button" @click=${onClick}>
      <div
        class=${classMap({
          'data-folder-picker-open-button_icon': true,
          'already-opened': viewModel.hasDataFolderAlreadyOpened,
        })}
      ></div>
    </div>
  `
}

function onClick() {
  NullaryCommand.openDataFolderPicker()
  CurrentState.commit()
}
