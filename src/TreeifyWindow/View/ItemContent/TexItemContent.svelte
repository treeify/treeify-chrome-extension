<script lang="ts">
  import katex from 'katex'
  import {TexItemContentProps} from './TexItemContentProps'

  export let props: TexItemContentProps
</script>

<div class="tex-content_rendered-tex">{@html katex.renderToString(props.code)}</div>

<style>
</style>
