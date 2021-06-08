import {doAsyncWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {TreeifyWindow} from 'src/TreeifyWindow/TreeifyWindow'
import {createDivElement} from 'src/TreeifyWindow/View/createElement'

export function FullWindowModeButtonView() {
  return createDivElement('toolbar-icon-button', {click: onClick}, [
    createDivElement('full-window-mode-button_icon'),
  ])
}

function onClick() {
  doAsyncWithErrorCapture(async () => {
    await TreeifyWindow.toFullWindowMode()
  })
}
