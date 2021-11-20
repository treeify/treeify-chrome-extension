import { doAsyncWithErrorCapture } from 'src/TreeifyTab/errorCapture'
import { registerLanguages } from 'src/TreeifyTab/highlightJs'
import { Instance } from 'src/TreeifyTab/Instance'
import { Chunk } from 'src/TreeifyTab/Internal/Chunk'
import { Database } from 'src/TreeifyTab/Internal/Database'
import { startup } from 'src/TreeifyTab/startup'
import StartupError from 'src/TreeifyTab/View/StartupError.svelte'

doAsyncWithErrorCapture(async () => {
  // Treeifyウィンドウが多重起動された場合はエラー画面を映す
  const windows = await chrome.windows.getAll({ populate: true })
  const tabs = windows.flatMap((window) => window.tabs ?? [])
  const treeifyTabUrl = chrome.runtime.getURL('TreeifyTab/index.html')
  if (tabs.filter((tab) => tab.url?.startsWith(treeifyTabUrl)).length > 1) {
    const spaRoot = document.querySelector('.spa-root')
    if (spaRoot instanceof HTMLElement) {
      new StartupError({
        target: spaRoot,
      })
    }
    return
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
