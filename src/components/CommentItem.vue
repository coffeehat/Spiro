<script lang="ts">
  import { PropType, defineComponent, computed } from 'vue';

  import { marked } from '../common/markdown';
  import { CommentItemInfo } from '../common/types';
  import { getLocalTimeFromTimestamp } from '../common/utils'

  export default defineComponent ({
    name: "Comment Item",
    computed: {
      local_time() {
        return getLocalTimeFromTimestamp(this.comment.comment_time);
      },
      md_comment() {
        return marked.parse(this.comment.comment);
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
    <div v-html="md_comment"></div>
  </div>
</template>

<style scoped>
  .comment_item_box {
    width: 100%;
    background-color: wheat;
    padding: 1px 10px;
    margin: 10px 0;
    outline: 1px solid black;
    border-radius: 15px;
  }
</style>