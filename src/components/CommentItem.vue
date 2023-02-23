<script lang="ts">
import { PropType, defineComponent } from 'vue';

import { ElMessageBox } from 'element-plus';
import { Avatar, genConfig } from "holiday-avatar";

import { marked } from '../common/markdown';
import { CommentItemInfo, SubCommentItemInfo } from '../common/types';
import { getLocalFormattedTimeFromTimestamp, genAvatarConfigByUserId, filterXSSAttack } from '../common/utils';
import { useCommentCUDStore, useUserStore, useReplyMutexStore, CommentCUDType } from '../stores';

import {
  getSubCommentList,
  CommentListGetMethod
} from '../common/network'
import MarkdownView from './MarkdownView.vue';
import CommentSubmitBox from './CommentSubmitBox.vue';
import { ReplyMutexScope } from '../stores/reply_mutex';

export default defineComponent({
  name: "Comment Item",
  computed: {
    local_time(): string {
      return getLocalFormattedTimeFromTimestamp(this.comment.comment_timestamp);
    },
    md_comment(): string {
      return marked.parse(filterXSSAttack(this.comment.comment_content));
    },
    // For css
    quote_angle_top(): number {
      return (this.avatar_size - 2 * this.comment_quote_triangle_size) / 2 - 3;
    },
    is_show_delete_button(): boolean {
      return this.userStore.is_valid
        && this.userStore.user_id == this.comment.user_id;
    },
    avatar_string(): string {
      return "";
    },
    submit_box_responible_list(): any {
      if (this.is_primary) {
        return this;
      } else {
        return this.belonging;
      }
    },
    delete_button_responsible_list(): any {
      return this.belonging;
    },
    avatar_config(): any {
      return genConfig(genAvatarConfigByUserId(this.comment.user_id) as any);
    },
    is_show_load_more_old_button(): Boolean {
      return this.is_primary && this.comment.is_more_old;
    },
    is_show_load_more_new_button(): Boolean {
      return this.is_primary && this.comment.is_more_new;
    },
    user_name(): string {
      return filterXSSAttack(this.comment.user_name);
    },
    to_user_name(): string {
      return filterXSSAttack(this.comment.to_user_name);
    },
    anchor(): string {
      if (this.is_primary) {
        return `spirorips_p_${this.comment.comment_id}`;
      } else {
        return `spirorips_s_${this.comment.comment_id}`;
      }
    }
  },
  props: {
    comment: {
      type: Object as PropType<CommentItemInfo>,
      required: true
    },
    is_primary: {
      type: Boolean,
      default: true
    },
    parent_comment_id: {
      type: Number,
      default: 0
    },
    reply_scope: {
      type: Object as PropType<ReplyMutexScope>,
      default: ReplyMutexScope.Scope_All
    },
    article_uuid: {
      type: String,
      required: true
    },
    number_of_new_load_sub_comments: {
      type: Number,
      default: 5
    },
    /* Belonging list*/
    belonging: null
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
        this.commentCudStore.delete(
          this.comment.comment_id,
          this.belonging
        );
      }).catch(() => {
        // do nothing
      });
    },
    onReply() {
      if (!this.is_show_comment_submit_box) {
        this.reply_mutex_ctrl_mask = true;
        this.replyMutex.acquire(this.reply_scope);
      }
      this.is_show_comment_submit_box = !this.is_show_comment_submit_box;
    },
    onClickLoadMoreOldSubComment() {
      if (this.is_primary && this.comment.sub_comment_list.length) {
        getSubCommentList(
          this.article_uuid,
          this.parent_comment_id,
          this.number_of_new_load_sub_comments,
          CommentListGetMethod.COUNT_FROM_COMMENT_ID,
          0,
          this.comment.sub_comment_list.at(-1)?.comment_id || 0,
          false,
          (comment_list, is_more_old, is_more_new) => {
            this.comment.is_more_old = is_more_old;
            // this.comment.is_more_new = is_more_new;
            this.comment.sub_comment_list.push.apply(this.comment.sub_comment_list, comment_list);
          }
        )
      }
      return false;
    },
    onClickLoadMoreNewSubComment() {
      if (this.is_primary && this.comment.sub_comment_list.length) {
        getSubCommentList(
          this.article_uuid,
          this.parent_comment_id,
          this.number_of_new_load_sub_comments,
          CommentListGetMethod.COUNT_FROM_COMMENT_ID,
          0,
          this.comment.sub_comment_list.at(0)?.comment_id || 0,
          true,
          (comment_list, is_more_old, is_more_new) => {
            // this.comment.is_more_old = is_more_old;
            this.comment.is_more_new = is_more_new;
            this.comment.sub_comment_list.unshift.apply(this.comment.sub_comment_list, comment_list);
          }
        )
      }
      return false;
    }
  },
  data() {
    return {
      /* Stores */
      userStore: useUserStore(),
      commentCudStore: useCommentCUDStore(),
      replyMutex: useReplyMutexStore(),

      is_show_comment_submit_box: false,
      reply_mutex_ctrl_mask: false,

      /* Some css need calculation */
      comment_quote_triangle_size: 8,
      avatar_size: 50,

      /* My self */
      self: this
    };
  },
  mounted() {
    this.replyMutex.$subscribe(
      (mutation, state) => {
        if (!this.reply_mutex_ctrl_mask
          && state.scope == this.reply_scope) {
          this.is_show_comment_submit_box = false;
        }
        this.reply_mutex_ctrl_mask = false;
      }
    );
    this.commentCudStore.$subscribe(
      (mutation, state) => {
        if (state.list_obj === this) {
          switch (state.type) {
            case CommentCUDType.Comment_Create: {
              this.comment.sub_comment_list.push(state.comment);
              break;
            }
            case CommentCUDType.Comment_Update: {
              break;
            }
            case CommentCUDType.Comment_Delete: {
              for (let i = 0; i != this.comment.sub_comment_list.length; ++i) {
                if (this.comment.sub_comment_list[i]
                  && this.comment.sub_comment_list[i].comment_id == state.comment.comment_id) {
                    this.comment.sub_comment_list.splice(i,1);
                  break;
                }
              }
              break;
            }
          }
        }
      }
    );
  },
  beforeDestroy() {
    window.removeEventListener('click', () => {}, true);
  },
  components: {
    MarkdownView: MarkdownView, 
    HldAvatar: Avatar,
    CommentSubmitBox: CommentSubmitBox
  }
});
</script>

<template>
  <div class="comment_item" :id="anchor">
    <div class="avatar_box">
      <!-- The Key attribute here is to force fresh the Avatar when user click page next in comment list -->
      <HldAvatar class="avatar" v-bind="{ ...avatar_config }" :key="comment.user_id"/>
    </div>
    <div class="sub_comment_guide_line" v-show="!is_primary">
      <div class="guide_block_upper_left"></div>
      <div class="guide_block_upper_right"></div>
      <div class="guide_block_lower_left"></div>
      <div class="guide_block_lower_right"></div>
    </div>
    <div class="comment_box">
      <div class="comment_content">
        <MarkdownView :rendered_markdown="md_comment" />
      </div>
      <div class="comment_title">
        <div class="comment_metainfo_box">
          <span class="comment_user_name">{{ user_name }}</span>
          <span v-if="comment.to_user_name" class="comment_time">回复 {{ to_user_name }} 于 {{ local_time }} </span>
          <span v-else-if="is_primary" class="comment_time">评论于 {{ local_time }} </span>
          <span v-else class="comment_time">回复于 {{ local_time }} </span>
        </div>
        <div class="comment_control_box">
          <el-button type="danger" size="small" @click="onDeleteComment" plain round
            v-show="is_show_delete_button">删除</el-button>
          <el-button type="primary" size="small" @click="onReply" plain round>回复</el-button>
        </div>
      </div>
      <div class="reply_submit_box" ref="reply_submit_box" v-if="is_show_comment_submit_box">
        <CommentSubmitBox :article_uuid="'0'" :parent_comment_id="parent_comment_id" :to_user_id="comment.user_id" :to_user_name="comment.user_name" :is_primary_submit_box="false" :comment_list_to_affect="submit_box_responible_list"/>
      </div>
      <div class="load_more_interactive" v-if="is_show_load_more_new_button">
        <a href="" @click.prevent="onClickLoadMoreNewSubComment">加载更多新回复</a>
      </div>
      <div class="sub_comment_box" v-if="is_primary">
        <CommentItem v-for="(item, index) in comment.sub_comment_list" :key="index" :comment="item" :is_primary="false" :parent_comment_id="comment.comment_id" :belonging="self"/>
      </div>
      <div class="load_more_interactive" v-if="is_show_load_more_old_button">
        <a href="" @click.prevent="onClickLoadMoreOldSubComment">加载更多旧回复</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.load_more_interactive {
  text-align: center;
  margin-bottom: 20px;
}

.load_more_interactive a:visited,
.load_more_interactive a:link {
  color: #409eff;
  text-decoration: none;
}

.load_more_interactive a:hover {
  color: #79bbff;
  text-decoration: none;
}

.load_more_interactive a:active {
  color: #337ecc;
  text-decoration: none;
}

.comment_title {
  padding: 0px 8px;
  border: 1px solid rgb(167, 167, 167);
  border-top: 0px;
  border-radius: 0px 0px 5px 5px;
  /* background-color: #ececec; */
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  align-items: center;
  min-height: 40px;
  /* Without this the line will not vertical aligned to center */
  line-height: 1rem;
  margin-top: -1px;
  margin-bottom: 20px;
  color: rgb(114, 114, 114);
}

.comment_title>* {
  margin-left: 5px;
}

.comment_box {
  width: 100%;
  position: relative;
}

.comment_box::before,
.comment_box::after {
  position: absolute;
  top: v-bind(quote_angle_top + "px");
  left: -16px;
  content: '';
  width: 0;
  height: 0;
  border-right: v-bind(comment_quote_triangle_size + "px") solid rgb(167, 167, 167);
  border-bottom: v-bind(comment_quote_triangle_size + "px") solid transparent;
  border-left: v-bind(comment_quote_triangle_size + "px") solid transparent;
  border-top: v-bind(comment_quote_triangle_size + "px") solid transparent;
}

.comment_box::after {
  left: -15px;
  border-right: 9px solid #ffffff;
}

.sub_comment_guide_line {
  display: none;
}

@media screen and (max-width: 874px) {

  /* TODO: need to evaluate whether its good to manipulate the element-ui internal */
  .comment_box::before,
  .comment_box::after {
    display: none;
  }

  .avatar_box {
    display: none;
  }

  .sub_comment_box {
    margin-left: 0px;
  }

  .sub_comment_guide_line {
    margin-top: -10px;
    margin-bottom: 10px;
  }

  .sub_comment_guide_line .guide_block_upper_right {
    border-left: 1px #a0cfff dashed;
    border-bottom: 1px #a0cfff dashed;
  }

  .sub_comment_guide_line .guide_block_lower_right {
    border-left: 1px #a0cfff dashed;
  }


  .sub_comment_box > .comment_item > .sub_comment_guide_line {
    display: grid;
    grid-template-columns: 4px 12px;
    grid-template-rows: 50% 50%;
  }

  .sub_comment_box > .comment_item:first-child > .sub_comment_guide_line {
    margin-top: -20px;
  }

  .sub_comment_box > .comment_item:last-child > .sub_comment_guide_line .guide_block_lower_right {
    border-left: 0px;
  }

  .sub_comment_box > .comment_item:last-child > .sub_comment_guide_line .guide_block_upper_right {
    border-radius: 0px 5px;
  }
}

.comment_metainfo_box {
  margin-bottom: 7px;
}

.comment_metainfo_box>* {
  margin-left: 6px;
}

.comment_content:hover + .comment_title > .comment_control_box,
.comment_title:hover > .comment_control_box {
  display: block;
}

.comment_control_box {
  display: none;
  margin-bottom: 7px;
}

.comment_control_box>* {
  margin-left: 6px;
}

.comment_content {
  padding: 18px 20px;
  border: 1px solid rgb(167, 167, 167);
  border-bottom: 0px;
  border-radius: 5px 5px 0px 0px;
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

.avatar_box {
  width: 50px;
  margin-right: 17px;
}

.avatar {
  width: v-bind(avatar_size + "px");
  height: v-bind(avatar_size + "px");
}

.comment_item {
  display: flex;
  flex-direction: row;
}

.reply_submit_box {
  margin-top: 10px;
  margin-bottom: 30px;
}

</style>  