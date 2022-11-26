<script lang="ts">
  import { PropType, defineComponent } from 'vue';

  import { CommentItemInfo } from '../common/types';

  export default defineComponent ({
    name: "Comment Item",
    props:
    {
      comment: {
        type: Object as PropType<CommentItemInfo>,
        required: true
      }
    }
  });
</script>

<template>
  <div class="comment_item_box">
    <p>Time: {{ comment.comment_time }} </p>
    <p>{{ comment.comment }}</p>
  </div>
</template>

<style scoped>
  .comment_item_box {
    width: 100%;
    background-color: gray;
  }
</style>