import { pipe } from 'fp-ts/function'
import { registerLanguages } from 'src/TreeifyTab/highlightJs'
import { Instance } from 'src/TreeifyTab/Instance'
import { Chunk } from 'src/TreeifyTab/Internal/Chunk'
import { Database } from 'src/TreeifyTab/Internal/Database'
import { startAutoSync, startup } from 'src/TreeifyTab/startup'
import { TreeifyTab } from 'src/TreeifyTab/TreeifyTab'
import { RArray$ } from 'src/Utility/fp-ts'
import { call } from 'src/Utility/function'
import Tab = chrome.tabs.Tab

call(async () => {
  // Treeifyウィンドウが多重起動された場合はタブIDでソートし、先頭以外のタブを閉じる
  const windows = await chrome.windows.getAll({ populate: true })
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  const duplicatedTabs = pipe(
    tabs,
    RArray$.filter((tab: Tab) => TreeifyTab.isTreeifyTab(tab.url)),
    RArray$.sortByNumber((tab: Tab) => tab.id!),
    RArray$.shift
  )
  for (const duplicatedTab of duplicatedTabs) {
    if (duplicatedTab.id !== undefined) {
      // 同時に閉じると何かの処理がインターリーブしてデータが不整合になる懸念が一応あるので、あえて並列化しない
      try {
        await chrome.tabs.remove(duplicatedTab.id)
      } catch {
        // タブを同時に閉じようとするとエラーが起きるはず。そのエラーは握りつぶす
      }
    }
  }

  console.log('インスタンスID = ' + Instance.getId())

  chrome.contextMenus.create({
    id: 'treeify',
    title: 'Treeifyの項目として取り込み',
    contexts: ['selection', 'image'],
    type: 'normal',
  })
  window.addEventListener('unload', () => {
    chrome.contextMenus.removeAll()
  })

  registerLanguages()

  await Database.migrate()

  // データベースから読み込んでStateを初期化
  const chunks = await Database.getAllChunks()
  await startup(Chunk.inflateStateFromChunks(chunks))

  await startAutoSync()
})
