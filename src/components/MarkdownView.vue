<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent ({
    name: "Markdown View Box",
    props:
    {
      rendered_markdown:
      {
        type: String,
        default: ""
      }
    },
  });
</script>

<template>
  <div class="markdown_box" v-html="rendered_markdown">
  </div>
</template>

<style scoped>
  .markdown_box :first-child {
    margin-top: 0 !important
  }

  .markdown_box :last-child {
    margin-bottom: 0 !important;
  }

</style>  