import {Device} from 'src/TreeifyTab/Device'
import {doAsyncWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {registerLanguages} from 'src/TreeifyTab/highlightJs'
import {Chunk} from 'src/TreeifyTab/Internal/Chunk'
import {Database} from 'src/TreeifyTab/Internal/Database'
import {startup} from 'src/TreeifyTab/startup'

doAsyncWithErrorCapture(async () => {
  console.log('デバイスID = ' + Device.getId())

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
