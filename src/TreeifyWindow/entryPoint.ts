import {DeviceId} from 'src/TreeifyWindow/DeviceId'
import {doAsyncWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {registerLanguages} from 'src/TreeifyWindow/highlightJs'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {startup} from 'src/TreeifyWindow/startup'

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
