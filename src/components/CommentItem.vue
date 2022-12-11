<script lang="ts">
  import { PropType, defineComponent, computed } from 'vue';

  import { marked } from '../common/markdown';
  import { CommentItemInfo } from '../common/types';
  import { getLocalTimeFromTimestamp } from '../common/utils'

  export default defineComponent ({
    name: "Comment Item",
    computed: {
      local_time() {
        return getLocalTimeFromTimestamp(this.comment.comment_timestamp);
      },
      md_comment() {
        return marked.parse(this.comment.comment_content);
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
    <div class="comment_item_title">
      <span class="comment_user_name">{{ comment.user_name }}</span>
      <span class="comment_time">{{ local_time }} </span>
    </div>
    <div v-html="md_comment"></div>
    <hr class="comment_separater"/>
  </div>
</template>

<style scoped>
  * {
    font-family: "Helvetica Neue","Helvetica","PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    color: #606266
  }

  .comment_item_box {
    width: 100%;
    padding: 1px 10px;
    margin: 10px 0;
    /* border-bottom: 1px solid gray; */
    /* border-radius: 15px; */
  }
  
  .comment_user_name {
    font-size: 30px;
    display: block;
    color: black;
  }

  .comment_separater {
    margin-top: 40px;
    border-color: #FFFFFF;
    background-color: #FFFFFF;
    color: #FFFFFF;
    outline-color: #FFFFFF;
    border-width: 1px;
    max-width: 99%;
  }
</style>