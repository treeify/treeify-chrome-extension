export const commandNames: {[T in string]: string} = {
  indent: 'インデント',
  unindent: 'アンインデント',
  moveItemUpward: '上に移動',
  moveItemDownward: '下に移動',
  moveItemToPrevSibling: '上に移動（兄弟指向）',
  moveItemToNextSibling: '下に移動（兄弟指向）',
  collapse: '折りたたむ',
  expand: '展開する',
  toggleCollapsed: '折りたたみ状態トグル',
  enterKeyDefault: 'Enterキーデフォルト動作',
  removeEdge: '項目を削除',
  deleteItemItself: '項目単体を削除',
  grouping: 'グルーピング',
  turnIntoPage: 'ページ化',
  turnIntoNonPage: '非ページ化',
  togglePaged: 'ページ化トグル',
  showPage: 'ページ切り替え',
  toggleCompleted: '完了状態トグル',
  toggleHighlighted: 'ハイライト状態トグル',
  toggleDoubtful: 'ダウトフル状態トグル',
  toggleCitation: '出典トグル',
  insertLineBreak: '項目内で改行',
  toggleBold: '太字トグル',
  toggleUnderline: '下線トグル',
  toggleItalic: 'イタリック体トグル',
  toggleStrikethrough: '打ち消し線トグル',
  hardUnloadItem: '単体をハードアンロード',
  hardUnloadSubtree: 'ツリーをハードアンロード',
  softUnloadItem: '単体をソフトアンロード',
  softUnloadSubtree: 'ツリーをソフトアンロード',
  loadItem: '単体をロード',
  loadSubtree: 'ツリーをロード',
  browseTab: 'ウェブページを閲覧',
  createEmptyCodeBlockItem: '空のコードブロック項目を作成',
  createEmptyTexItem: '空のTeX項目を作成',
  createEmptyTextItem: '空のテキスト項目を作成',
  selectAllAboveItems: '長男まで選択',
  selectAllBelowItems: '末弟まで選択',
  copyForTransclusion: 'トランスクルード用コピー',
  pasteAsPlainText: 'テキストそのまま貼り付け',
  showEditDialog: '編集ダイアログを表示',
  showWorkspaceDialog: 'ワークスペースダイアログを表示',
  showOtherParentsDialog: '他のトランスクルード元を表示',
  showSearchDialog: '検索ダイアログを表示',
  showCitationSettingDialog: '出典設定ダイアログを表示',
  showContextMenuDialog: 'コンテキストメニューを表示',
  doNothing: '何もしない',
  toggleExcluded: '除外トグル',
  syncWithDataFolder: 'データフォルダ同期',
}
