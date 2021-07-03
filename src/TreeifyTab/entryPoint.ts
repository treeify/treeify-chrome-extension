import {DeviceId} from 'src/TreeifyTab/DeviceId'
import {doAsyncWithErrorCapture} from 'src/TreeifyTab/errorCapture'
import {registerLanguages} from 'src/TreeifyTab/highlightJs'
import {Internal} from 'src/TreeifyTab/Internal/Internal'
import {startup} from 'src/TreeifyTab/startup'

doAsyncWithErrorCapture(async () => {
  console.log('デバイスID = ' + DeviceId.get())

  chrome.contextMenus.create({
    id: 'selection',
    title: 'Treeifyの項目として取り込み',
    contexts: ['selection'],
    type: 'normal',
  })
  window.addEventListener('unload', () => {
    chrome.contextMenus.removeAll()
  })

  registerLanguages()

  await startup(Internal.createSampleState())
})
