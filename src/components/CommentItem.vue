<script lang="ts">
  import { PropType, defineComponent, computed } from 'vue';

  import { CommentItemInfo } from '../common/types';
  import { getLocalTimeFromTimestamp } from '../common/utils'

  export default defineComponent ({
    name: "Comment Item",
    computed: {
      local_time() {
        return getLocalTimeFromTimestamp(this.comment.comment_time);
      }
    },
    props: {
      comment: {
        type: Object as PropType<CommentItemInfo>,
        required: true
      }
    }
  });
</script>

<template>
  <div class="comment_item_box">
    <h2>User: {{ comment.user_id }}</h2>
    <p>Time: {{ local_time }} </p>
    <p>{{ comment.comment }}</p>
  </div>
</template>

<style scoped>
  .comment_item_box {
    width: 100%;
    background-color: gray;
  }
</style>