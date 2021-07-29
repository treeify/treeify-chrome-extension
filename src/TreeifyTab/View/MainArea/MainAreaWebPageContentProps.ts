import {ItemType} from 'src/TreeifyTab/basicType'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {External} from 'src/TreeifyTab/External/External'
import {Command} from 'src/TreeifyTab/Internal/Command'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {CiteProps, createCiteProps} from 'src/TreeifyTab/View/CiteProps'

export type MainAreaWebPageContentProps = {
  itemPath: ItemPath
  type: ItemType.WEB_PAGE
  title: string
  faviconUrl: string
  isLoading: boolean
  isSoftUnloaded: boolean
  isHardUnloaded: boolean
  isUnread: boolean
  isAudible: boolean
  citeProps: CiteProps | undefined
  onFocus: (event: FocusEvent) => void
  onClickTitle: (event: MouseEvent) => void
  onClickFavicon: (event: MouseEvent) => void
}

export function createMainAreaWebPageContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaWebPageContentProps {
  const itemId = ItemPath.getItemId(itemPath)
  const webPageItem = state.webPageItems[itemId]
  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
  const tab =
    tabId !== undefined ? External.instance.tabItemCorrespondence.getTab(tabId) : undefined
  const isUnloaded = External.instance.tabItemCorrespondence.isUnloaded(itemId)

  return {
    itemPath,
    type: ItemType.WEB_PAGE,
    title: CurrentState.deriveWebPageItemTitle(itemId),
    faviconUrl: webPageItem.faviconUrl,
    isLoading: tab?.status === 'loading',
    isSoftUnloaded: tab?.discarded === true,
    isHardUnloaded: tab === undefined,
    isUnread: webPageItem.isUnread,
    isAudible: tab?.audible === true,
    citeProps: createCiteProps(itemPath),
    onFocus: (event) => {
      doWithErrorCapture(() => {
        // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
        if (event.target instanceof Node) {
          getSelection()?.setPosition(event.target)
        }
      })
    },
    onClickTitle: (event) => {
      doWithErrorCapture(() => {
        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            event.preventDefault()
            CurrentState.setTargetItemPath(itemPath)
            Command.browseTab()
            Rerenderer.instance.rerender()
            break
        }
      })
    },
    onClickFavicon: (event) => {
      doWithErrorCapture(() => {
        event.stopPropagation()
        event.preventDefault()

        CurrentState.setTargetItemPath(itemPath)

        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            if (tab === undefined) {
              // ハードアンロード状態の場合
              Command.loadItem()
            } else {
              // ソフトアンロード状態またはロード状態の場合
              Command.hardUnloadSubtree()
            }

            Rerenderer.instance.rerender()
            break
          case '1000MouseButton0':
            if (tab === undefined) {
              // ハードアンロード状態の場合
              Command.loadSubtree()
            } else {
              // ソフトアンロード状態またはロード状態の場合
              Command.hardUnloadItem()
            }

            Rerenderer.instance.rerender()
            break
          case '0100MouseButton0':
            if (isUnloaded) {
              // アンロード状態の場合
              Command.loadItem()
            } else {
              // ロード状態の場合
              Command.softUnloadSubtree()
            }

            Rerenderer.instance.rerender()
            break
          case '1100MouseButton0':
            if (isUnloaded) {
              // アンロード状態の場合
              Command.loadSubtree()
            } else {
              // ロード状態の場合
              Command.softUnloadItem()
            }

            Rerenderer.instance.rerender()
            break
        }
      })
    },
  }
}
