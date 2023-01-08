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
      is_more: false,
      comment_count: 0,
      current_page: 1,
      is_show_list: false,
      self: this
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
    },
    sub_comments_per_primary_comments:
    {
      type: Number,
      default: 3
    },
    number_of_new_load_sub_comments:
    {
      type: Number,
      default: 5
    },
    use_pagination:
    {
      type: Boolean,
      default: false
    },
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
        this.sub_comments_per_primary_comments,
        (comment_list, is_more) => {
          this.is_more = is_more;
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
        this.sub_comments_per_primary_comments,
        (comment_list, is_more) => {
          this.comment_list = comment_list;
          this.is_more = is_more;
          sortCommentList(this.comment_list);
        }
      );
    },
    onClickLoadMoreSubComment() {
      getCommentList(
        this.article_id,
        this.comment_list.length,
        this.comments_per_page,
        this.sub_comments_per_primary_comments,
        (comment_list, is_more) => {
          this.is_more = is_more;
          this.comment_list.push.apply(this.comment_list, comment_list);
          sortCommentList(this.comment_list);
        }
      );
      return false;
    }
  },
  mounted() {
    this.refreshComment();
    this.newCommentStore.$subscribe(
      (mutation, state) => {
        // TODO: Ugly implementation..... Need refinement
        if (state.list_obj === 0) {
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
      <CommentItem v-for="(item, index) in comment_list" :key="index" :comment="item" :is_primary="true" :parent_comment_id="item.comment_id" :comment_list_to_affect="0" :belonging="0" :article_id="article_id" :number_of_new_load_sub_comments="number_of_new_load_sub_comments"/>
    </div>
    <div class="pagination" v-if="use_pagination">
      <el-pagination layout="prev, pager, next" :page-size="comments_per_page" :page-count="comment_pages"
        @current-change="onPageChange" @prev-click="onPageChange" @next-click="onPageChange"
        :hide-on-single-page="true">
      </el-pagination>
    </div>
    <div class="load_more_interactive" v-if="!use_pagination && is_more">
      <a href="" @click.prevent="onClickLoadMoreSubComment">加载更多评论</a>
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