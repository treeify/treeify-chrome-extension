import { External } from 'src/TreeifyTab/External/External'
import { Internal } from 'src/TreeifyTab/Internal/Internal'

function dumpCurrentMemory() {
  Internal.instance.dumpCurrentState()
  External.instance.dumpCurrentState()
}
