<script lang="ts">
  import {List} from 'immutable'
  import {assert} from '../../../Common/Debug/assert'
  import {TOP_ITEM_ID} from '../../basicType'
  import {doWithErrorCapture} from '../../errorCapture'
  import {toOpmlString} from '../../Internal/ImportExport/opml'
  import {Internal} from '../../Internal/Internal'
  import {State} from '../../Internal/State'
  import CommonDialog from './CommonDialog.svelte'
  import {PreferenceDialogProps} from './PreferenceDialogProps'

  export let props: PreferenceDialogProps

  function onClickExportButton() {
    doWithErrorCapture(() => {
      const fileName = 'treeify.opml'

      const content = toOpmlString(List.of(List.of(TOP_ITEM_ID)))
      const aElement = document.createElement('a')
      aElement.href = window.URL.createObjectURL(new Blob([content], {type: 'application/xml'}))
      aElement.download = fileName
      aElement.click()

      assert(State.isValid(Internal.instance.state))
    })
  }
</script>

<CommonDialog title="環境設定">
  <button on:click={onClickExportButton}>OPMLファイルをエクスポート</button>
</CommonDialog>
