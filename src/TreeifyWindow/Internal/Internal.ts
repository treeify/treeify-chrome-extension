import {List} from 'immutable'
import {assertNonUndefined} from 'src/Common/Debug/assert'
import {ItemType} from 'src/TreeifyWindow/basicType'
import {PropertyPath} from 'src/TreeifyWindow/Internal/PropertyPath'
import {State} from 'src/TreeifyWindow/Internal/State'
import {Timestamp} from 'src/TreeifyWindow/Timestamp'
import {derived, Readable, writable} from 'svelte/store'

/** TODO: コメント */
export class Internal {
  private static _instance: Internal | undefined

  readonly state: State

  // 再描画制御変数。
  // 画面の再描画の唯一のトリガーとして運用するストア。
  // 値の内容に意味はないが、プリミティブ値だと更新イベントが起きないので{}にした。
  readonly #rerenderingPulse = writable({})

  private readonly mutatedPropertyPaths = new Set<PropertyPath>()
  private readonly stateChangeListeners = new Set<
    (newState: State, mutatedPropertyPaths: Set<PropertyPath>) => void
  >()

  private constructor(initialState: State) {
    Internal._instance = this

    this.state = initialState
  }

  /**
   * シングルトンインスタンスを生成する。
   * 生成されたインスタンスは.instanceで取得できる。
   */
  static initialize(initialState: State) {
    // 次のように書かずともコンストラクタ内でthis._instanceに代入しているので問題ない。
    // this._instance = new Internal(initialState)
    new Internal(initialState)
  }

  /**
   * シングルトンインスタンスを取得する。
   * 通常のシングルトンと異なり、インスタンスを自動生成する機能は無いので要注意。
   * インスタンス未生成の場合はエラー。
   */
  static get instance(): Internal {
    assertNonUndefined(this._instance)
    return this._instance
  }

  /** シングルトンインスタンスを破棄する */
  static cleanup() {
    this._instance = undefined
  }

  /**
   * 画面を再描画すべきタイミングで更新イベントが起こるストアを返す。
   * タイミングを伝えるだけなので値に意味はない。
   */
  get rerenderingPulse(): Readable<{}> {
    return this.#rerenderingPulse
  }

  /** Stateへの変更を確定し、stateChangeListenerに通知する */
  commit() {
    this.#rerenderingPulse.set({})

    for (const stateChangeListener of this.stateChangeListeners) {
      stateChangeListener(this.state, this.mutatedPropertyPaths)
    }
    this.mutatedPropertyPaths.clear()
  }

  /** State内の書き換えた箇所を伝える */
  markAsMutated(propertyPath: PropertyPath) {
    this.mutatedPropertyPaths.add(propertyPath)
  }

  addStateChangeListener(
    listener: (newState: State, mutatedPropertyPaths: Set<PropertyPath>) => void
  ) {
    this.stateChangeListeners.add(listener)
  }

  dumpCurrentState() {
    console.groupCollapsed('ダンプ：Internal#state')
    const stateString = JSON.stringify(this.state, State.jsonReplacer, 2)
    console.log(stateString)
    console.groupEnd()
  }

  /**
   * 頻出パターンの略記用ユーティリティ関数。
   * 関数名はderivedの頭文字というだけで他に特に意味はない。
   */
  static d<T>(f: () => T): Readable<T> {
    return derived(Internal.instance.rerenderingPulse, f)
  }

  static createInitialState(): State {
    return {
      items: {
        0: {
          itemType: ItemType.TEXT,
          childItemIds: writable(List.of()),
          parents: {},
          timestamp: writable(Timestamp.now()),
          cssClasses: writable(List.of()),
        },
      },
      textItems: {
        0: {
          innerHtml: writable('Top'),
        },
      },
      webPageItems: {},
      imageItems: {},
      codeBlockItems: {},
      pages: {
        0: {
          targetItemPath: writable(List.of(0)),
          anchorItemPath: writable(List.of(0)),
          defaultWindowMode: 'keep',
        },
      },
      workspaces: {
        [Timestamp.now()]: {
          excludedItemIds: writable(List.of()),
          name: 'ワークスペース1',
        },
      },
      mountedPageIds: writable(List.of(0)),
      availableItemIds: List.of(),
      maxItemId: 0,
      itemTreeKeyboardBinding: {
        '0000Tab': List.of({commandName: 'indentItem'}),
        '0100Tab': List.of({commandName: 'unindentItem'}),
        '1000ArrowUp': List.of({commandName: 'moveItemToPrevSibling'}),
        '1000ArrowDown': List.of({commandName: 'moveItemToNextSibling'}),
        '1100ArrowUp': List.of({commandName: 'moveItemUpward'}),
        '1100ArrowDown': List.of({commandName: 'moveItemDownward'}),
        '0000Enter': List.of({commandName: 'enterKeyDefault'}),
        '0100Enter': List.of({commandName: 'insertLineBreak'}),
        '1000Enter': List.of({commandName: 'toggleGrayedOut'}),
        '1000KeyT': List.of({commandName: 'toDualWindowMode'}, {commandName: 'openNewTab'}),
        '1000KeyL': List.of({commandName: 'toggleHighlighted'}),
        '1000KeyD': List.of({commandName: 'removeEdge'}),
        '1000KeyP': List.of({commandName: 'toggleCollapsed'}),
        '1000KeyO': List.of({commandName: 'toggleBold'}),
        '1000KeyU': List.of({commandName: 'toggleUnderline'}),
        '1000KeyI': List.of({commandName: 'toggleItalic'}),
        '1000KeyK': List.of({commandName: 'toggleStrikethrough'}),
        '1000KeyS': List.of({commandName: 'saveToDataFolder'}),
        '0010KeyC': List.of({commandName: 'copyForTransclusion'}),
        '1100KeyL': List.of({commandName: 'createEmptyCodeBlockItem'}),
        '0010KeyW': List.of({commandName: 'showDefaultWindowModeSettingDialog'}),
        '0110KeyW': List.of({commandName: 'showWorkspaceDialog'}),
        '0010KeyE': List.of({commandName: 'excludeFromCurrentWorkspace'}),
        '0000F2': List.of({commandName: 'edit'}),
        '0100F2': List.of({commandName: 'showLabelEditDialog'}),
        '0000F3': List.of({commandName: 'showOtherParentsDialog'}),
        '0110ArrowDown': List.of({commandName: 'selectAllBelowItems'}),
        '0110ArrowUp': List.of({commandName: 'selectAllAboveItems'}),
      },
      itemTreeDeleteButtonMouseBinding: {
        '0000MouseButton0': List.of({commandName: 'removeEdge'}),
        '1000MouseButton0': List.of({commandName: 'deleteItemItself'}),
      },
      webPageItemTitleSettingDialog: writable(null),
      codeBlockItemEditDialog: writable(null),
      defaultWindowModeSettingDialog: writable(null),
      workspaceDialog: writable(null),
      labelEditDialog: writable(null),
      otherParentsDialog: writable(null),
    }
  }

  static createSampleState(): State {
    return {
      items: {
        0: {
          itemType: ItemType.TEXT,
          childItemIds: writable(List.of(1, 2, 5, 8)),
          parents: {},
          timestamp: writable(1604284090000),
          cssClasses: writable(List.of()),
        },
        1: {
          itemType: ItemType.TEXT,
          childItemIds: writable(List.of(3, 6, 7)),
          parents: {0: {isCollapsed: writable(false), labels: writable(List.of())}},
          timestamp: writable(1604284090001),
          cssClasses: writable(List.of()),
        },
        2: {
          itemType: ItemType.TEXT,
          childItemIds: writable(List.of(4)),
          parents: {0: {isCollapsed: writable(true), labels: writable(List.of())}},
          timestamp: writable(1604284090002),
          cssClasses: writable(List.of()),
        },
        3: {
          itemType: ItemType.TEXT,
          childItemIds: writable(List.of()),
          parents: {1: {isCollapsed: writable(false), labels: writable(List.of())}},
          timestamp: writable(1604284090003),
          cssClasses: writable(List.of()),
        },
        4: {
          itemType: ItemType.TEXT,
          childItemIds: writable(List.of()),
          parents: {2: {isCollapsed: writable(false), labels: writable(List.of())}},
          timestamp: writable(1604284090004),
          cssClasses: writable(List.of('grayed-out')),
        },
        5: {
          itemType: ItemType.WEB_PAGE,
          childItemIds: writable(List.of()),
          parents: {0: {isCollapsed: writable(false), labels: writable(List.of('サンプル'))}},
          timestamp: writable(1604284090005),
          cssClasses: writable(List.of()),
        },
        6: {
          itemType: ItemType.TEXT,
          childItemIds: writable(List.of()),
          parents: {1: {isCollapsed: writable(false), labels: writable(List.of())}},
          timestamp: writable(1604284090006),
          cssClasses: writable(List.of()),
        },
        7: {
          itemType: ItemType.IMAGE,
          childItemIds: writable(List.of()),
          parents: {1: {isCollapsed: writable(false), labels: writable(List.of())}},
          timestamp: writable(1604284090007),
          cssClasses: writable(List.of()),
        },
        8: {
          itemType: ItemType.CODE_BLOCK,
          childItemIds: writable(List.of()),
          parents: {0: {isCollapsed: writable(false), labels: writable(List.of())}},
          timestamp: writable(1604284090008),
          cssClasses: writable(List.of()),
        },
      },
      textItems: {
        0: {
          innerHtml: writable('Top'),
        },
        1: {
          innerHtml: writable('isCollapsed false'),
        },
        2: {
          innerHtml: writable('isCollapsed true'),
        },
        3: {
          innerHtml: writable('visible child'),
        },
        4: {
          innerHtml: writable('invisible child'),
        },
        6: {
          innerHtml: writable('子ページ'),
        },
      },
      webPageItems: {
        5: {
          url: writable('https://ao-system.net/favicon/'),
          faviconUrl: writable('https://ao-system.net/favicon.ico'),
          tabTitle: writable('ファビコン作成 favicon.ico 無料で半透過マルチアイコンが作れます'),
          title: writable(null),
          isUnread: writable(true),
        },
      },
      imageItems: {
        7: {
          url: writable(
            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tamias_striatus2.jpg/320px-Tamias_striatus2.jpg'
          ),
          caption: writable('tamias'),
        },
      },
      codeBlockItems: {
        8: {
          code: writable(
            "const url = 'https://google.com/'\n" +
              'if (url.length > 10 || /https:/.test(url)) {\n' +
              '  console.log(`OK: ${url.length}`)\n' +
              '}\n'
          ),
          language: writable('javascript'),
        },
      },
      pages: {
        0: {
          targetItemPath: writable(List.of(0)),
          anchorItemPath: writable(List.of(0)),
          defaultWindowMode: 'keep',
        },
        6: {
          targetItemPath: writable(List.of(6)),
          anchorItemPath: writable(List.of(6)),
          defaultWindowMode: 'inherit',
        },
      },
      workspaces: {
        [Timestamp.now()]: {
          excludedItemIds: writable(List.of()),
          name: 'ワークスペース1',
        },
      },
      mountedPageIds: writable(List.of(0)),
      availableItemIds: List.of(),
      maxItemId: 8,
      itemTreeKeyboardBinding: {
        '0000Tab': List.of({commandName: 'indentItem'}),
        '0100Tab': List.of({commandName: 'unindentItem'}),
        '1000ArrowUp': List.of({commandName: 'moveItemToPrevSibling'}),
        '1000ArrowDown': List.of({commandName: 'moveItemToNextSibling'}),
        '1100ArrowUp': List.of({commandName: 'moveItemUpward'}),
        '1100ArrowDown': List.of({commandName: 'moveItemDownward'}),
        '0000Enter': List.of({commandName: 'enterKeyDefault'}),
        '0100Enter': List.of({commandName: 'insertLineBreak'}),
        '1000Enter': List.of({commandName: 'toggleGrayedOut'}),
        '1000KeyT': List.of({commandName: 'toDualWindowMode'}, {commandName: 'openNewTab'}),
        '1000KeyL': List.of({commandName: 'toggleHighlighted'}),
        '1000KeyD': List.of({commandName: 'removeEdge'}),
        '1000KeyP': List.of({commandName: 'toggleCollapsed'}),
        '1000KeyO': List.of({commandName: 'toggleBold'}),
        '1000KeyU': List.of({commandName: 'toggleUnderline'}),
        '1000KeyI': List.of({commandName: 'toggleItalic'}),
        '1000KeyK': List.of({commandName: 'toggleStrikethrough'}),
        '1000KeyS': List.of({commandName: 'saveToDataFolder'}),
        '0010KeyC': List.of({commandName: 'copyForTransclusion'}),
        '1100KeyL': List.of({commandName: 'createEmptyCodeBlockItem'}),
        '0010KeyW': List.of({commandName: 'showDefaultWindowModeSettingDialog'}),
        '0110KeyW': List.of({commandName: 'showWorkspaceDialog'}),
        '0010KeyE': List.of({commandName: 'excludeFromCurrentWorkspace'}),
        '0000F2': List.of({commandName: 'edit'}),
        '0100F2': List.of({commandName: 'showLabelEditDialog'}),
        '0000F3': List.of({commandName: 'showOtherParentsDialog'}),
        '0110ArrowDown': List.of({commandName: 'selectAllBelowItems'}),
        '0110ArrowUp': List.of({commandName: 'selectAllAboveItems'}),
      },
      itemTreeDeleteButtonMouseBinding: {
        '0000MouseButton0': List.of({commandName: 'removeEdge'}),
        '1000MouseButton0': List.of({commandName: 'deleteItemItself'}),
      },
      webPageItemTitleSettingDialog: writable(null),
      codeBlockItemEditDialog: writable(null),
      defaultWindowModeSettingDialog: writable(null),
      workspaceDialog: writable(null),
      labelEditDialog: writable(null),
      otherParentsDialog: writable(null),
    }
  }
}
