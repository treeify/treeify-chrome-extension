<script lang="ts">
  import ItemContent from '../ItemContent/ItemContent.svelte'
  import {createItemContentProps} from '../ItemContent/ItemContentProps.js'
  import {TabsDialogItemProps} from './TabsDialogItemProps'

  export let props: TabsDialogItemProps
</script>

<ItemContent props={createItemContentProps(props.itemId)} />

<style global lang="scss">
</style>
