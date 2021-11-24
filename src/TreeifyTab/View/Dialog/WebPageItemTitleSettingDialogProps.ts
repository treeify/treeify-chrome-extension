import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { MainAreaContentView } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import { assertNonNull, assertNonUndefined } from 'src/Utility/Debug/assert'

export type WebPageItemTitleSettingDialogProps = {
  rect: DOMRect
  fontSize: string
  /** タイトル入力欄のテキストの初期値 */
  initialTitle: string
}

export function createWebPageItemTitleSettingDialogProps(): WebPageItemTitleSettingDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const targetItemId = ItemPath.getItemId(targetItemPath)

  const domElementId = MainAreaContentView.focusableDomElementId(targetItemPath)
  const domElement = document
    .getElementById(domElementId)
    ?.querySelector('.main-area-web-page-content_title')
  assertNonNull(domElement)
  assertNonUndefined(domElement)

  return {
    rect: domElement.getBoundingClientRect(),
    fontSize: getComputedStyle(domElement).getPropertyValue('font-size'),
    initialTitle: CurrentState.deriveWebPageItemTitle(targetItemId),
  }
}
