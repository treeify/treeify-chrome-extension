<script lang="ts">
  import { DomishObject } from 'src/TreeifyTab/Internal/DomishObject'
  import { TextItemContentProps } from 'src/TreeifyTab/View/ItemContent/TextItemContentProps'

  export let props: TextItemContentProps
</script>

<div class="text-item-content_root" class:has-source={props.hasSource}>
  {@html DomishObject.toHtml(props.domishObjects)}
</div>

<style global lang="scss">
  .text-item-content_root {
    &.has-source {
      // lch(80.0%, 0.0, 0.0)相当
      border-left: 0.25em solid #c6c6c6;
      padding-left: 0.2em;
    }
  }
</style>
