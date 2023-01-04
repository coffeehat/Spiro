<script lang="ts">
import { defineComponent, isShallow } from 'vue';

// libs
import {
  getCommentList,
  getCommentCount
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
      comment_count: 0,
      current_page: 1,
      is_show_list: false
    }
  },
  computed: {
    comment_pages() {
      return Math.ceil(this.comment_count / this.comments_per_page);
    }
  },
  props:
  {
    article_id:
    {
      type: Number,
      default: 0
    },
    comments_per_page:
    {
      type: Number,
      default: 10
    }
  },
  methods: {
    onPageChange(index: number) {
      this.current_page = index;
      let offset = this.comments_per_page * (index - 1);
      let length = this.comments_per_page;
      getCommentList(
        this.article_id,
        offset,
        length,
        (comment_list) => {
          this.comment_list = comment_list;
          sortCommentList(this.comment_list);
        }
      );
    },
    refreshCount(): void {
      getCommentCount(
        this.article_id,
        (count: number) => {
          this.comment_count = count;
          if (count > 0) {
            this.is_show_list = true;
          }
        }
      );
    },
    refreshComment(): void {
      this.refreshCount();
      let offset = this.comments_per_page * (this.current_page - 1);
      let length = this.comments_per_page;
      getCommentList(
        this.article_id,
        offset,
        length,
        (comment_list) => {
          this.comment_list = comment_list;
          sortCommentList(this.comment_list);
        }
      );
    }
  },
  mounted() {
    this.refreshComment();
    this.newCommentStore.$subscribe(
      (mutation, state) => {
        switch (state.type) {
          case CommentCUDType.Comment_Create: {
            if (this.current_page == 1) {
              this.comment_list.unshift(state.comment);
            }
            this.refreshCount();
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
            this.refreshCount();
            break;
          }
        }
      }
    );
  },
  beforeMount() {
    this.refreshCount();
  }
});
</script>

<template>
  <div class="comment_list_container" v-show="is_show_list">
    <h2>所有评论</h2>
    <div class="comment_list">
      <CommentItem v-for="(item, index) in comment_list" :key="index" :comment="item" :is_primary="true" :parent_comment_id="item.comment_id"/>
    </div>
    <div class="pagination">
      <el-pagination layout="prev, pager, next" :page-size="comments_per_page" :page-count="comment_pages"
        @current-change="onPageChange" @prev-click="onPageChange" @next-click="onPageChange"
        :hide-on-single-page="true">
      </el-pagination>
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
</style>