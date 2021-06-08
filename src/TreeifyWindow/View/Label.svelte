<script lang="ts">
  type LabelViewModel = {
    text: string
  }

  export let viewModel: LabelViewModel
</script>

<span class="label">{viewModel.text}</span>

<style>
  .label {
    border-radius: 9999px;
    padding: 0 0.25em;

    border: hsl(0, 0%, 80%) 1px solid;
    background: hsl(0, 0%, 95%);
    color: hsl(0, 0%, 30%);
  }
</style>
