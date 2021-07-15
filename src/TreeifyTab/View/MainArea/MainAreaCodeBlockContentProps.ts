import {ItemType} from 'src/TreeifyTab/basicType'
import {doWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {ItemPath} from 'src/TreeifyTab/Internal/ItemPath'
import {State} from 'src/TreeifyTab/Internal/State'
import {CiteProps, createCiteProps} from 'src/TreeifyTab/View/CiteProps'

export type MainAreaCodeBlockContentProps = {
  itemPath: ItemPath
  itemType: ItemType.CODE_BLOCK
  code: string
  language: string
  citeProps: CiteProps | undefined
  onFocus: (event: FocusEvent) => void
}

export function createMainAreaCodeBlockContentProps(
  state: State,
  itemPath: ItemPath
): MainAreaCodeBlockContentProps {
  const itemId = ItemPath.getItemId(itemPath)

  const codeBlockItem = state.codeBlockItems[itemId]
  return {
    itemPath,
    itemType: ItemType.CODE_BLOCK,
    code: codeBlockItem.code,
    language: codeBlockItem.language,
    citeProps: createCiteProps(itemPath),
    onFocus: (event) => {
      doWithErrorCapture(() => {
        // focusだけでなくselectionも設定しておかないとcopyイベント等が発行されない
        if (event.target instanceof Node) {
          getSelection()?.setPosition(event.target)
        }
      })
    },
  }
}
