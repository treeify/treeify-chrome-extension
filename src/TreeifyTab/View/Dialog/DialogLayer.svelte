<script lang="ts">
  import {DialogLayerProps} from './DialogLayerProps'

  export let props: DialogLayerProps
</script>

{#if props.dialog !== undefined}
  <svelte:component this={props.dialog.component} props={props.dialog.props} />
{/if}
