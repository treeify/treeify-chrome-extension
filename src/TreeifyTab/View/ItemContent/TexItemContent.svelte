<script lang="ts">
  import katex from 'katex'
  import {TexItemContentProps} from './TexItemContentProps'

  export let props: TexItemContentProps
</script>

<div class="tex-content_rendered-tex">
  {@html katex.renderToString(props.code, {throwOnError: false})}
</div>

<style global lang="scss">
</style>
