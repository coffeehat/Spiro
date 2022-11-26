<script lang="ts">
  import { defineComponent } from 'vue';
  
  // libs
  import { getCommentList } from '../common/network'
  import { CommentItemInfo } from '../common/types';

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
        comment_list: [] as CommentItemInfo[],
      }
    },
    props:
    {
      article_id:
      {
        type: Number,
        default: 0
      }
    },
    methods: {
      addNewComment(comment : any) : void {
        this.comment_list.unshift(comment);
      }
    },
    mounted() {
      getCommentList(
        this.article_id,
        (comment_list) => {
          this.comment_list = comment_list;
        }
      );
      this.addNewComment(1);
      eventBus.on('addNewComment', this.addNewComment);
    },
    beforeUnmount() {
      eventBus.off('addNewComment', this.addNewComment);
    }
  });
</script>

<template>
  <div>
    <CommentItem v-for="(item, index) in comment_list" :key="index" :comment="item.comment" />
  </div>
</template>

<style scoped>

</style>