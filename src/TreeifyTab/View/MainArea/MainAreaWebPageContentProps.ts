import { External } from 'src/TreeifyTab/External/External'
import { Command } from 'src/TreeifyTab/Internal/Command'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { InputId } from 'src/TreeifyTab/Internal/InputId'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { State } from 'src/TreeifyTab/Internal/State'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'
import { MainAreaContentProps } from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'
import { createSourceProps, SourceProps } from 'src/TreeifyTab/View/SourceProps'

export type MainAreaWebPageContentProps = {
  itemPath: ItemPath
  title: string
  faviconUrl: string
  isLoading: boolean
  isDiscarded: boolean
  isTabClosed: boolean
  isUnread: boolean
  isAudible: boolean
  sourceProps: SourceProps | undefined
  onFocus(event: FocusEvent): void
  onClickTitle(event: MouseEvent): void
  onClickFavicon(event: MouseEvent): void
}

export function createMainAreaWebPageContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaContentProps {
  const itemId = ItemPath.getItemId(itemPath)
  const webPageItem = state.webPageItems[itemId]
  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
  const tab =
    tabId !== undefined ? External.instance.tabItemCorrespondence.getTab(tabId) : undefined
  const isUnloaded =
    tabId === undefined || External.instance.tabItemCorrespondence.getTab(tabId)?.discarded === true

  return {
    itemPath,
    type: 'MainAreaWebPageContentProps',
    title: CurrentState.deriveWebPageItemTitle(itemId),
    faviconUrl: webPageItem.faviconUrl,
    isLoading: tab?.status === 'loading',
    isDiscarded: tab?.discarded === true,
    isTabClosed: tab === undefined,
    isUnread: webPageItem.isUnread,
    isAudible: tab?.audible === true,
    sourceProps: createSourceProps(itemId),
    onFocus(event) {
      // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
      if (event.target instanceof Node) {
        getSelection()?.setPosition(event.target)
      }
    },
    onClickTitle(event) {
      switch (InputId.fromMouseEvent(event)) {
        case '0000MouseButton0':
          event.preventDefault()
          CurrentState.setTargetItemPath(itemPath)
          Command.browseTab()
          Rerenderer.instance.rerender()
          break
      }
    },
    onClickFavicon(event) {
      event.stopPropagation()
      event.preventDefault()

      CurrentState.setTargetItemPath(itemPath)
      Rerenderer.instance.requestToFocusTargetItem()

      switch (InputId.fromMouseEvent(event)) {
        case '0000MouseButton0':
          if (tab === undefined) {
            // タブが閉じられている場合
            Command.openJustOneTab()
          } else {
            // discard状態またはロード状態の場合
            Command.closeTreeTabs()
          }

          Rerenderer.instance.rerender()
          break
        case '1000MouseButton0':
          if (tab === undefined) {
            // タブが閉じられている場合
            Command.openTreeTabs()
          } else {
            // discard状態またはロード状態の場合
            Command.closeJustOneTab()
          }

          Rerenderer.instance.rerender()
          break
        case '0100MouseButton0':
          if (isUnloaded) {
            // アンロード状態の場合
            Command.openJustOneTab()
          } else {
            // ロード状態の場合
            Command.discardTreeTabs()
          }

          Rerenderer.instance.rerender()
          break
        case '1100MouseButton0':
          if (isUnloaded) {
            // アンロード状態の場合
            Command.openTreeTabs()
          } else {
            // ロード状態の場合
            Command.discardJustOneTab()
          }

          Rerenderer.instance.rerender()
          break
      }
    },
  }
}
