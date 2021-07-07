import {is} from 'immutable'
import {ItemType} from 'src/TreeifyTab/basicType'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {External} from 'src/TreeifyTab/External/External'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyTab/Internal/NullaryCommand'
import {State} from 'src/TreeifyTab/Internal/State'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'
import {CiteProps, createCiteProps} from 'src/TreeifyTab/View/CiteProps'
import {MainAreaContentView} from 'src/TreeifyTab/View/MainArea/MainAreaContentProps'

export type MainAreaWebPageContentProps = {
  itemPath: ItemPath
  itemType: ItemType.WEB_PAGE
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
  onDragStart: (event: DragEvent) => void
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
    itemType: ItemType.WEB_PAGE,
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
            NullaryCommand.browseTab()
            Rerenderer.instance.rerender()
            break
          case '1000MouseButton0':
            event.preventDefault()
            CurrentState.setTargetItemPath(itemPath)
            Rerenderer.instance.rerender()
            break
          case '0100MouseButton0':
            event.preventDefault()
            if (is(itemPath.pop(), CurrentState.getTargetItemPath().pop())) {
              CurrentState.setTargetItemPathOnly(itemPath)
              Rerenderer.instance.rerender()
            }
            break
          case '0010MouseButton0':
            event.preventDefault()
            CurrentState.setTargetItemPath(itemPath)
            NullaryCommand.browseTab()
            Rerenderer.instance.rerender()
            break
        }
      })
    },
    onClickFavicon: (event) => {
      doWithErrorCapture(() => {
        CurrentState.setTargetItemPath(itemPath)

        switch (InputId.fromMouseEvent(event)) {
          case '0000MouseButton0':
            event.preventDefault()

            if (tab === undefined) {
              // ハードアンロード状態の場合
              NullaryCommand.loadSubtree()
            } else {
              // ソフトアンロード状態またはロード状態の場合
              NullaryCommand.hardUnloadSubtree()
            }

            Rerenderer.instance.rerender()
            break
          case '1000MouseButton0':
            event.preventDefault()

            if (tab === undefined) {
              // ハードアンロード状態の場合
              NullaryCommand.loadItem()
            } else {
              // ソフトアンロード状態またはロード状態の場合
              NullaryCommand.hardUnloadItem()
            }

            Rerenderer.instance.rerender()
            break
          case '0100MouseButton0':
            event.preventDefault()

            if (isUnloaded) {
              // アンロード状態の場合
              NullaryCommand.loadSubtree()
            } else {
              // ロード状態の場合
              NullaryCommand.softUnloadSubtree()
            }

            Rerenderer.instance.rerender()
            break
          case '1100MouseButton0':
            event.preventDefault()

            if (isUnloaded) {
              // アンロード状態の場合
              NullaryCommand.loadItem()
            } else {
              // ロード状態の場合
              NullaryCommand.softUnloadItem()
            }

            Rerenderer.instance.rerender()
            break
        }
      })
    },
    onDragStart: (event) => {
      doWithErrorCapture(() => {
        if (event.dataTransfer === null) return

        const domElementId = MainAreaContentView.focusableDomElementId(itemPath)
        const domElement = document.getElementById(domElementId)
        if (domElement === null) return
        // ドラッグ中にマウスポインターに追随して表示される内容を設定
        event.dataTransfer.setDragImage(domElement, 0, domElement.offsetHeight / 2)

        event.dataTransfer.setData('application/treeify', JSON.stringify(itemPath))
      })
    },
  }
}
