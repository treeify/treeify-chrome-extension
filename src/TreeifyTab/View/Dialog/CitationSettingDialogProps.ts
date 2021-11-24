import { External } from 'src/TreeifyTab/External/External'
import { CurrentState } from 'src/TreeifyTab/Internal/CurrentState'
import { Internal } from 'src/TreeifyTab/Internal/Internal'
import { ItemPath } from 'src/TreeifyTab/Internal/ItemPath'
import { Rerenderer } from 'src/TreeifyTab/Rerenderer'

export type CitationSettingDialogProps = {
  title: string
  url: string
  onSubmit: (title: string, url: string) => void
  onClickCancelButton: () => void
}

export function createCitationSettingDialogProps(): CitationSettingDialogProps {
  const targetItemPath = CurrentState.getTargetItemPath()
  const item = Internal.instance.state.items[ItemPath.getItemId(targetItemPath)]

  return {
    title: item.cite?.title ?? '',
    url: item.cite?.url ?? '',
    onSubmit: (title: string, url: string) => {
      const targetItemId = ItemPath.getItemId(targetItemPath)

      // citeプロパティを更新
      CurrentState.setCite(targetItemId, { title, url })

      // タイムスタンプを更新
      CurrentState.updateItemTimestamp(targetItemId)

      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
    onClickCancelButton: () => {
      // ダイアログを閉じる
      External.instance.dialogState = undefined
      Rerenderer.instance.rerender()
    },
  }
}
