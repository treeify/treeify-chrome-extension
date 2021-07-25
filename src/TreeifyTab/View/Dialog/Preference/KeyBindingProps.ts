import {List} from 'immutable'
import {CommandId} from 'src/TreeifyTab/basicType'
import {InputId} from 'src/TreeifyTab/Internal/InputId'

export type KeyBindingProps = {
  inputId: string
  commandIds: List<CommandId>
  commandGroups: List<CommandGroup>
}

export function createKeyBindingProps(binding: [InputId, List<CommandId>]): KeyBindingProps {
  return {
    inputId: binding[0],
    commandIds: binding[1],
    commandGroups,
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
  {name: 'その他', commandIds: List.of('saveToDataFolder', 'toggleExcluded')}
)
