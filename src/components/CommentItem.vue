<script lang="ts">
import { PropType, defineComponent } from 'vue';

import { ElMessageBox } from 'element-plus';

import { marked } from '../common/markdown';
import { CommentItemInfo } from '../common/types';
import { getLocalFormattedTimeFromTimestamp } from '../common/utils';
import { useCommentCUDStore, useUserStore } from '../stores';

import MarkdownView from './MarkdownView.vue';

export default defineComponent({
  name: "Comment Item",
  computed: {
    local_time(): string {
      return getLocalFormattedTimeFromTimestamp(this.comment.comment_timestamp);
    },
    md_comment(): string {
      return marked.parse(this.comment.comment_content);
    },
    // For css
    quote_angle_top(): number {
      return (this.comment_title_height - 2 * this.comment_quote_triangle_size) / 2;
    },
    avatar_margin_top(): number {
      let temp = (this.comment_title_height - this.avatar_size) / 2;
      return temp > 0 ? temp : 0;
    },
    comment_title_margin_top(): number {
      let temp = (this.avatar_size - this.comment_title_height) / 2;
      return temp > 0 ? temp : 0;
    },
    is_show_delete_button(): boolean {
      return this.userStore.is_valid
        && this.userStore.user_id == this.comment.user_id;
    }
  },
  props: {
    comment: {
      type: Object as PropType<CommentItemInfo>,
      required: true
    }
  },
  methods: {
    onDeleteComment() {
      ElMessageBox.confirm(
        "确定要删除这条评论吗？",
        "警告",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: 'warning',
        }
      ).then(() => {
        this.commentCudStore.delete(this.comment.comment_id);
      }).catch(() => {
        // do nothing
      });
    }
  },
  data() {
    return {
      userStore: useUserStore(),
      commentCudStore: useCommentCUDStore(),
      /* Some css need calculation */
      comment_title_height: 42,
      comment_quote_triangle_size: 8,
      avatar_size: 50
    };
  },
  components: { MarkdownView }
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
        <div class="comment_metainfo_box">
          <span class="comment_user_name">{{ comment.user_name }}</span>
          <span class="comment_time">评论于 {{ local_time }} </span>
        </div>
        <div class="comment_control_box">
          <el-button type="danger" size="small" @click="onDeleteComment" plain round
            v-show="is_show_delete_button">删除</el-button>
          <el-button type="primary" size="small" plain round>回复</el-button>
        </div>
      </div>
      <div class="comment_content">
        <MarkdownView :rendered_markdown="md_comment" />
      </div>
    </div>
  </div>
</template>

<style scoped>
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

@media screen and (max-width: 874px) {

  /* TODO: need to evaluate whether its good to manipulate the element-ui internal */
  .comment_title::before,
  .comment_title::after {
    display: none;
  }

  .avatar_box {
    display: none;
  }
}

.comment_metainfo_box>* {
  margin-right: 6px;
}

.comment_control_box {
  margin-left: auto;
}

.comment_control_box>* {
  margin-left: 6px;
}

.comment_content {
  padding: 12px 15px;
  border: 1px solid rgb(167, 167, 167);
  border-radius: 0px 0px 5px 5px;
  margin-top: -1px;
}

.comment_content :first-child {
  margin-top: 0 !important
}

.comment_content :last-child {
  margin-bottom: 0 !important;
}

.comment_user_name {
  font-weight: 700;
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
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
}
</style>  