import { pipe } from 'fp-ts/function'
import { registerLanguages } from 'src/TreeifyTab/highlightJs'
import { Instance } from 'src/TreeifyTab/Instance'
import { Chunk } from 'src/TreeifyTab/Internal/Chunk'
import { Database } from 'src/TreeifyTab/Internal/Database'
import { startup } from 'src/TreeifyTab/startup'
import { Rist } from 'src/Utility/fp-ts'
import { call } from 'src/Utility/function'
import Tab = chrome.tabs.Tab

call(async () => {
  // Treeifyウィンドウが多重起動された場合はタブIDでソートし、先頭以外のタブを閉じる
  const windows = await chrome.windows.getAll({ populate: true })
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  const treeifyTabUrl = chrome.runtime.getURL('TreeifyTab/index.html')
  const duplicatedTabs = pipe(
    tabs,
    Rist.filter((tab: Tab) => tab.url?.startsWith(treeifyTabUrl) === true),
    Rist.sortByNumber((tab: Tab) => tab.id!),
    Rist.shift
  )
  for (const duplicatedTab of duplicatedTabs) {
    if (duplicatedTab.id !== undefined) {
      // 大した理由はないが、あえて並列化しない。
      // 三重起動されることはほぼありえないし、
      // 同時に閉じると何かの処理がインターリーブしてデータが不整合になる懸念もある。
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
})
