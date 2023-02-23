<script lang="ts">
import { defineComponent, isShallow } from 'vue';

// libs
import {
  getCommentList,
  CommentListGetMethod
} from '../common/network'
import { CommentItemInfoList } from '../common/types';
import { sortCommentList } from '../common/utils';
import { useCommentCUDStore, CommentCUDType } from '../stores';

// Vue components
import CommentItem from './CommentItem.vue'

export default defineComponent({
  name: "Comment List Box",
  components: {
    CommentItem
  },
  data() {
    return {
      newCommentStore: useCommentCUDStore(),
      comment_list: [] as CommentItemInfoList,
      is_more_old: false,
      is_more_new: false,
      is_show_list: false,
      self: this
    }
  },
  props:
  {
    article_uuid:
    {
      type: String,
      default: "0"
    },
    number_of_primary_comments_at_start:
    {
      type: Number,
      default: 10
    },
    number_of_sub_comments_per_primary_at_start:
    {
      type: Number,
      default: 3
    },
    number_of_new_load_primary_comment:
    {
      type: Number,
      default: 10
    },
    number_of_new_load_sub_comments:
    {
      type: Number,
      default: 5
    }
  },
  methods: {
    loadCommentAtStart(): void {
      getCommentList(
        this.article_uuid,
        this.number_of_primary_comments_at_start,
        this.number_of_sub_comments_per_primary_at_start,
        CommentListGetMethod.COUNT_FROM_OFFSET,
        0,
        0,
        false,
        (comment_list, is_more_old, is_more_new) => {
          this.comment_list = comment_list;
          this.is_more_old = is_more_old;
          this.is_more_new = is_more_new;
          if (comment_list.length > 0) {
            this.is_show_list = true;
          }
        }
      );
    },
    onClickLoadMoreOldComment() {
      if (this.comment_list.length) {
        getCommentList(
          this.article_uuid,
          this.number_of_new_load_primary_comment,
          this.number_of_sub_comments_per_primary_at_start,
          CommentListGetMethod.COUNT_FROM_COMMENT_ID,
          this.comment_list.length,
          this.comment_list.at(-1)?.comment_id || 0,   // Actually it's not possible to pass into 0
          false,
          (comment_list, is_more_old, is_more_new) => {
            this.is_more_old = is_more_old;
            this.is_more_new = is_more_new;
            this.comment_list.push.apply(this.comment_list, comment_list);
          }
        );
      }
      return false;
    },
    onClickLoadMoreNewComment() {
      if (this.comment_list.length) {
        getCommentList(
          this.article_uuid,
          this.number_of_new_load_primary_comment,
          this.number_of_sub_comments_per_primary_at_start,
          CommentListGetMethod.COUNT_FROM_COMMENT_ID,
          this.comment_list.length,
          this.comment_list.at(0)?.comment_id || 0,   // Actually it's not possible to pass into 0
          true,
          (comment_list, is_more_old, is_more_new) => {
            this.is_more_old = is_more_old;
            this.is_more_new = is_more_new;
            this.comment_list.unshift.apply(this.comment_list, comment_list);
          }
        );
      }
      return false;
    }
  },
  mounted() {
    this.loadCommentAtStart();
    this.newCommentStore.$subscribe(
      (mutation, state) => {
        // TODO: Ugly implementation..... Need refinement
        if (state.list_obj === 0) {
          switch (state.type) {
            case CommentCUDType.Comment_Create: {
              this.comment_list.unshift(state.comment);
              break;
            }
            case CommentCUDType.Comment_Update: {
              break;
            }
            case CommentCUDType.Comment_Delete: {
              for (let i = 0; i != this.comment_list.length; ++i) {
                if (this.comment_list[i]
                  && this.comment_list[i].comment_id == state.comment.comment_id) {
                  this.comment_list.splice(i,1);
                  break;
                }
              }
              break;
            }
          }
        }
      }
    );
  }
});
</script>

<template>
  <div class="comment_list_container" v-show="is_show_list">
    <h2>所有评论</h2>
    <div class="load_more_interactive" v-if="is_more_new">
      <a href="" @click.prevent="onClickLoadMoreNewComment">加载更多新评论</a>
    </div>
    <div class="comment_list">
      <CommentItem v-for="(item, index) in comment_list" :key="index" :comment="item" :is_primary="true" :parent_comment_id="item.comment_id" :comment_list_to_affect="0" :belonging="0" :article_uuid="article_uuid" :number_of_new_load_sub_comments="number_of_new_load_sub_comments"/>
    </div>
    <div class="load_more_interactive" v-if="is_more_old">
      <a href="" @click.prevent="onClickLoadMoreOldComment">加载更多旧评论</a>
    </div>
  </div>
</template>

<style scoped>
.comment_list_container {
  display: flex;
  flex-direction: column;
  /* min-height: 100vh; */
}

/* .comment_list {
    flex: 1 0 auto;
  } */

.pagination {
  display: flex;
  justify-content: center;
  margin: 40px 0;
  /* flex: 0 0 auto; */
}

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
</style>