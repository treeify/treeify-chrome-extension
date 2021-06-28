import {DeviceId} from 'src/TreeifyWindow/DeviceId'
import {doAsyncWithErrorCapture} from 'src/TreeifyWindow/errorCapture'
import {registerLanguages} from 'src/TreeifyWindow/highlightJs'
import {Internal} from 'src/TreeifyWindow/Internal/Internal'
import {startup} from 'src/TreeifyWindow/startup'

doAsyncWithErrorCapture(async () => {
  console.log('デバイスID = ' + DeviceId.get())

  registerLanguages()

  await startup(Internal.createSampleState())
})
