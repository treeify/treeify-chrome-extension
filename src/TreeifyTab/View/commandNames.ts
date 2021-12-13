export const commandNames = {
  indent: 'インデント',
  unindent: 'アンインデント',
  moveItemToAbove: '項目を上に移動',
  moveItemToBelow: '項目を下に移動',
  moveItemToPrevSibling: '項目を上に移動（兄弟指向）',
  moveItemToNextSibling: '項目を下に移動（兄弟指向）',
  fold: '折りたたむ',
  unfold: '展開する',
  toggleFolded: '折りたたみ状態トグル',
  enterKeyDefault: 'Enterキーデフォルト動作',
  deleteItem: '項目を削除',
  removeItem: '項目を除去',
  deleteJustOneItem: '項目単体を削除',
  grouping: 'グルーピング',
  turnIntoPage: 'ページ化',
  turnIntoNonPage: '非ページ化',
  togglePaged: 'ページ化トグル',
  switchPage: 'ページ切り替え',
  toggleCompleted: '完了状態トグル',
  toggleHighlighted: 'ハイライト状態トグル',
  toggleDoubtful: 'ダウトフル状態トグル',
  toggleSource: '出典トグル',
  insertNewline: '項目内で改行',
  toggleBold: '太字トグル',
  toggleUnderline: '下線トグル',
  toggleItalic: 'イタリック体トグル',
  toggleStrikethrough: '打ち消し線トグル',
  closeJustOneTab: '項目に紐づくタブを閉じる',
  closeTreeTabs: 'ツリーに紐づくタブを閉じる',
  discardJustOneTab: '項目に紐づくタブをdiscard',
  discardTreeTabs: 'ツリーに紐づくタブをdiscard',
  openJustOneTab: '項目に紐づくタブをバックグラウンドで開く',
  openTreeTabs: 'ツリーに紐づくタブをバックグラウンドで開く',
  browseTab: '項目に紐づくタブを閲覧',
  createImageItem: '画像項目を作成',
  createCodeBlockItem: 'コードブロック項目を作成',
  createTexItem: 'TeX項目を作成',
  createTextItem: 'テキスト項目を作成',
  selectToStartOfList: '長男まで選択',
  selectToEndOfList: '末弟まで選択',
  copyForTransclude: 'トランスクルード用コピー',
  copyForMove: '移動用コピー',
  pasteAsPlainText: 'プレーンテキストとして貼り付け',
  showEditDialog: '編集ダイアログを表示',
  showExportDialog: 'エクスポートダイアログを表示',
  showWorkspaceDialog: 'ワークスペースダイアログを表示',
  showOtherParentsDialog: '他のトランスクルード元を表示',
  showSearchDialog: '検索ダイアログを表示',
  showReplaceDialog: '置換ダイアログを表示',
  showSourceSettingDialog: '出典設定ダイアログを表示',
  showContextMenuDialog: 'コンテキストメニューを表示',
  showCommandPaletteDialog: 'コマンドパレットを表示',
  doNothing: '何もしない',
  toggleExcluded: '除外トグル',
  syncTreeifyData: 'データを同期',
  convertSpaceToNewline: '半角スペースを改行に変換',
} as const
