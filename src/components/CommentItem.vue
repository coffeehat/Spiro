<script lang="ts">
  import { PropType, defineComponent, computed } from 'vue';

  import { marked } from '../common/markdown';
  import { CommentItemInfo } from '../common/types';
  import { getLocalTimeFromTimestamp } from '../common/utils'

  export default defineComponent ({
    name: "Comment Item",
    computed: {
      local_time() : string {
        return getLocalTimeFromTimestamp(this.comment.comment_timestamp);
      },
      md_comment() : string {
        return marked.parse(this.comment.comment_content);
      },

      // For css
      quote_angle_top() : number {
        return (this.comment_title_height - 2 * this.comment_quote_triangle_size) / 2;
      },

      avatar_margin_top() : number {
        let temp = (this.comment_title_height - this.avatar_size) / 2;
        return temp > 0 ? temp : 0;
      },

      comment_title_margin_top() : number {
        let temp = (this.avatar_size - this.comment_title_height) / 2;
        return temp > 0 ? temp : 0;
      }
    },
    props: {
      comment: {
        type: Object as PropType<CommentItemInfo>,
        required: true
      }
    },
    data() {
      return {
        /* Some css need calculation */
        comment_title_height: 50,
        comment_quote_triangle_size: 8,
        avatar_size: 50
      }
    }
  });
</script>

<template>
  <div class="comment_item">
    <div class="avatar_box">
      <div class="avatar">
      </div>
    </div>
    <div class="comment_box">
      <div class="comment_title">
        <span class="comment_user_name">{{ comment.user_name }}</span>
        <span class="comment_time">{{ local_time }} </span>
      </div>
      <div class="comment_content">
        <div v-html="md_comment"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  * {
    font-family: "-apple-system","BlinkMacSystemFont","Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif;
    color: rgb(22, 22, 22)
  }

  .comment_title {
    padding: 0px 12px;
    border: 1px solid rgb(167, 167, 167);
    border-radius: 5px 5px 0px 0px;
    background-color: #ececec;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: v-bind(comment_title_height + "px");
    /* Without this the line will not vertical aligned to center */
    line-height: 1rem;
    margin-top: v-bind(comment_title_margin_top + "px");
  }

  .comment_title::before,
  .comment_title::after {
    position: absolute;
    top: v-bind(quote_angle_top + "px");
    left: -17px;
    content: '';
    width: 0;
    height: 0;
    border-right: v-bind(comment_quote_triangle_size + "px") solid rgb(167, 167, 167);
    border-bottom: v-bind(comment_quote_triangle_size + "px") solid transparent;
    border-left: v-bind(comment_quote_triangle_size + "px") solid transparent;
    border-top: v-bind(comment_quote_triangle_size + "px") solid transparent;
  }
  .comment_title::after {
    left: -16px;
    border-right: 9px solid #ececec;
  }

  .comment_content {
    padding: 12px 15px;
    border: 1px solid rgb(167,167,167);
    border-radius: 0px 0px 5px 5px;
    margin-top: -1px;
  }

  .comment_user_name {
    font-weight: 700;
    margin-right: 5px
  }

  .comment_box {
    width: 100%;
  }

  .avatar_box {
    width: 50px;
    margin-right: 17px;
  }

  .avatar {
    width: v-bind(avatar_size + "px");
    height: v-bind(avatar_size + "px");
    background-color: rgb(102, 245, 197);
    border-radius: v-bind(avatar_size / 2 + "px");
    margin-top: v-bind(avatar_margin_top + "px");
  }

  .comment_item {
    display:flex;
    flex-direction: row;
    margin-bottom: 20px;
  }

</style>  