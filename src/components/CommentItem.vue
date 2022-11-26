<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent ({
    name: "Comment Item",
    props:
    {
      comment:
      {
        type: String
      }
    }
  });
</script>

<template>
  <div>
    {{ comment }}
  </div>
</template>

<style scoped>

</style>