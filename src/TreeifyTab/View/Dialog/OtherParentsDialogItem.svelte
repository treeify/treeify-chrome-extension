<script lang="ts">
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {createItemContentProps} from '../ItemContent/ItemContentProps.js'
  import {OtherParentsDialogItemProps} from './OtherParentsDialogItemProps'

  export let props: OtherParentsDialogItemProps
</script>

<div class="other-parents-dialog-item">
  <ItemContent props={createItemContentProps(props.itemId)} />
</div>

<style global lang="scss">
</style>
