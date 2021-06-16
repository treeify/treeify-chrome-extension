import {List} from 'immutable'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {doWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {External} from 'src/TreeifyWindow/External/External'
import {CurrentState} from 'src/TreeifyWindow/Internal/CurrentState'
import {InputId} from 'src/TreeifyWindow/Internal/InputId'
import {ItemPath} from 'src/TreeifyWindow/Internal/ItemPath'
import {NullaryCommand} from 'src/TreeifyWindow/Internal/NullaryCommand'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Rerenderer} from 'src/TreeifyWindow/Rerenderer'
import {ItemTreeContentView} from 'src/TreeifyWindow/View/ItemTree/ItemTreeContentProps'

export type ItemTreeWebPageContentProps = {
  itemPath: ItemPath
  itemType: ItemType.WEB_PAGE
  labels: List<string>
  title: string
  faviconUrl: string
  isLoading: boolean
  isSoftUnloaded: boolean
  isHardUnloaded: boolean
  isUnread: boolean
  isAudible: boolean
  onFocus: (event: FocusEvent) => void
  onClickTitle: (event: MouseEvent) => void
  onClickFavicon: (event: MouseEvent) => void
  onDragStart: (event: DragEvent) => void
}

export function createItemTreeWebPageContentProps(
  state: State,
  itemPath: ItemPath
): ItemTreeWebPageContentProps {
  const itemId = ItemPath.getItemId(itemPath)
  const webPageItem = state.webPageItems[itemId]
  const tabId = External.instance.tabItemCorrespondence.getTabIdBy(itemId)
  const tab =
    tabId !== undefined ? External.instance.tabItemCorrespondence.getTab(tabId) : undefined
  const isUnloaded = External.instance.tabItemCorrespondence.isUnloaded(itemId)

  return {
    itemPath,
    labels: CurrentState.getLabels(itemPath),
    itemType: ItemType.WEB_PAGE,
    title: CurrentState.deriveWebPageItemTitle(itemId),
    faviconUrl: webPageItem.faviconUrl,
    isLoading: tab?.status === 'loading',
    isSoftUnloaded: tab?.discarded === true,
    isHardUnloaded: tab === undefined,
    isUnread: webPageItem.isUnread,
    isAudible: tab?.audible === true,
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
            CurrentState.setTargetItemPath(itemPath)
            NullaryCommand.browseTabInDualWindowMode()
            Rerenderer.instance.rerender()
            break
          case '1000MouseButton0':
            CurrentState.setTargetItemPath(itemPath)
            Rerenderer.instance.rerender()
            break
          case '0010MouseButton0':
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

        const domElementId = ItemTreeContentView.focusableDomElementId(itemPath)
        const domElement = document.getElementById(domElementId)
        if (domElement === null) return
        // ドラッグ中にマウスポインターに追随して表示される内容を設定
        event.dataTransfer.setDragImage(domElement, 0, domElement.offsetHeight / 2)

        event.dataTransfer.setData('application/treeify', JSON.stringify(itemPath))
      })
    },
  }
}
