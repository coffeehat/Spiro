<script lang="ts">
  import { defineComponent, isShallow } from 'vue';
  
  // libs
  import {
    getCommentList,
    getCommentCount
  } from '../common/network'
  import { CommentItemInfoList } from '../common/types';
  import { sortCommentList } from '../common/utils';

  // Vue components
  import CommentItem from './CommentItem.vue'
  import eventBus from '../common/eventBus'

  export default defineComponent ({
    name: "Comment List Box",
    components: {
      CommentItem
    },
    data() {
      return {
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
      addNewComment(comment : any) : void {
        if (this.current_page == 1) {
          this.comment_list.unshift(comment);
        }
        this.refreshCount();
        // if (this.current_page != 1) {
        //   this.refreshComment();
        // }
      },
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
      refreshCount() : void {
        getCommentCount(
          this.article_id,
          (count : number) => {
            this.comment_count = count;
            if (count > 0) {
              this.is_show_list = true;
            }
          }
        );
      },
      refreshComment() : void {
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
      eventBus.on('addNewComment', this.addNewComment);
    },
    beforeMount() {
      this.refreshCount();
    },
    beforeUnmount() {
      eventBus.off('addNewComment', this.addNewComment);
    }
  });
</script>

<template>
  <div class="comment_list_container" v-show="is_show_list">
    <h2>所有评论</h2>
    <div class="comment_list">
      <CommentItem v-for="(item, index) in comment_list" :key="index" :comment="item" />
    </div>
    <div class="pagination">
      <el-pagination
        layout="prev, pager, next"
        :page-size="comments_per_page"
        :page-count="comment_pages"
        @current-change="onPageChange"
        @prev-click="onPageChange"
        @next-click="onPageChange"
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