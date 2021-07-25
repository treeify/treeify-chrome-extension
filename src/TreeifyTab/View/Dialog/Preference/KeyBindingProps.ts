import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {CommandId} from 'src/TreeifyTab/basicType'
import {InputId} from 'src/TreeifyTab/Internal/InputId'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {PropertyPath} from 'src/TreeifyTab/Internal/PropertyPath'
import {Rerenderer} from 'src/TreeifyTab/Rerenderer'

export type KeyBindingProps = {
  inputId: string
  commandIds: List<CommandId>
  commandGroups: List<CommandGroup>
  onChange: (event: Event) => void
  onClickDeleteButton: (event: Event) => void
  onClickAddCommandButton: (event: Event) => void
}

export function createKeyBindingProps(binding: [InputId, List<CommandId>]): KeyBindingProps {
  const inputId = binding[0]
  const commandIds = binding[1]

  function onChange(event: Event) {
    if (event.target instanceof HTMLSelectElement) {
      // コマンドリストの何番目が変更されたかを取得する
      assertNonUndefined(event.target.dataset.index)
      const index = parseInt(event.target.dataset.index)

      const oldCommandIds = Internal.instance.state.mainAreaKeyBindings[inputId]
      const newCommandIds = oldCommandIds.set(index, event.target.value)
      Internal.instance.mutate(newCommandIds, PropertyPath.of('mainAreaKeyBindings', inputId))
    }
  }

  function onClickDeleteButton(event: Event) {
    if (event.target instanceof HTMLElement) {
      if (commandIds.size === 1) {
        // 残り1個のコマンドを削除する際は、空リストにする代わりにバインディングそのものを削除する
        Internal.instance.delete(PropertyPath.of('mainAreaKeyBindings', inputId))
      } else {
        // コマンドリストの何番目のボタンが押下されたかを取得する
        assertNonUndefined(event.target.dataset.index)
        const index = parseInt(event.target.dataset.index)

        const oldCommandIds = Internal.instance.state.mainAreaKeyBindings[inputId]
        const newCommandIds = oldCommandIds.remove(index)
        Internal.instance.mutate(newCommandIds, PropertyPath.of('mainAreaKeyBindings', inputId))
      }
      Rerenderer.instance.rerender()
    }
  }

  function onClickAddCommandButton(event: Event) {
    if (event.target instanceof HTMLElement) {
      // コマンドリストの何番目のボタンが押下されたかを取得する
      assertNonUndefined(event.target.dataset.index)
      const index = parseInt(event.target.dataset.index)

      const oldCommandIds = Internal.instance.state.mainAreaKeyBindings[inputId]
      const newCommandIds = oldCommandIds.insert(index + 1, 'doNothing')
      Internal.instance.mutate(newCommandIds, PropertyPath.of('mainAreaKeyBindings', inputId))
      Rerenderer.instance.rerender()
    }
  }

  return {
    inputId,
    commandIds,
    commandGroups,
    onChange,
    onClickDeleteButton,
    onClickAddCommandButton,
  }
}

export type CommandGroup = {name: string; commandIds: List<CommandId>}

// コマンド一覧をoptgroup要素でグルーピングするためのデータ
const commandGroups: List<CommandGroup> = List.of(
  {
    name: '基本操作',
    commandIds: List.of(
      'indentItem',
      'unindentItem',
      'moveItemUpward',
      'moveItemDownward',
      'moveItemToPrevSibling',
      'moveItemToNextSibling',
      'collapseItem',
      'expandItem',
      'toggleCollapsed',
      'enterKeyDefault',
      'removeEdge',
      'deleteItemItself',
      'groupingItems'
    ),
  },
  {
    name: 'テキスト編集',
    commandIds: List.of(
      'insertLineBreak',
      'toggleBold',
      'toggleUnderline',
      'toggleItalic',
      'toggleStrikethrough'
    ),
  },
  {
    name: 'ウェブページ項目操作',
    commandIds: List.of(
      'browseTab',
      'hardUnloadItem',
      'hardUnloadSubtree',
      'softUnloadItem',
      'softUnloadSubtree',
      'loadItem',
      'loadSubtree'
    ),
  },
  {
    name: 'ページ関連',
    commandIds: List.of('turnIntoPage', 'turnIntoNonPage', 'togglePaged', 'showPage'),
  },
  {
    name: '項目装飾',
    commandIds: List.of('toggleGrayedOut', 'toggleHighlighted', 'toggleDoubtful', 'toggleCitation'),
  },
  {
    name: '空の項目作成',
    commandIds: List.of('createEmptyCodeBlockItem', 'createEmptyTexItem', 'createEmptyTextItem'),
  },
  {name: '複数選択', commandIds: List.of('selectAllAboveItems', 'selectAllBelowItems')},
  {name: 'クリップボード', commandIds: List.of('copyForTransclusion', 'pasteAsPlainText')},
  {
    name: 'ダイアログ表示',
    commandIds: List.of(
      'showEditDialog',
      'showSearchDialog',
      'showCitationSettingDialog',
      'showContextMenuDialog',
      'showWorkspaceDialog',
      'showOtherParentsDialog'
    ),
  },
  {name: 'その他', commandIds: List.of('doNothing', 'saveToDataFolder', 'toggleExcluded')}
)
