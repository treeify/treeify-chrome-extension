import {doAsyncWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {CurrentState} from 'src/TreeifyTab/Internal/CurrentState'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'

export type CiteProps = {
  cite: string
  citeUrl: string
  onClick: (event: MouseEvent) => void
}

export function createCiteProps(itemPath: ItemPath): CiteProps | undefined {
  const itemId = ItemPath.getItemId(itemPath)
  const item = Internal.instance.state.items[itemId]
  if (item.cite === '' && item.citeUrl === '') return undefined

  return {
    cite: item.cite,
    citeUrl: item.citeUrl,
    onClick: (event: MouseEvent) => {
      doAsyncWithErrorCapture(async () => {
        // TODO: 修飾キー+クリックでタブをバックグラウンドで開けるようにするのが有力

        CurrentState.setTargetItemPath(itemPath)
        // タブを開く
        await chrome.tabs.create({url: item.citeUrl})
      })
    },
  }
}
