<script lang="ts">
  import { defineComponent } from 'vue';

  // libs
  import { submitComment } from '../common/network';
  import eventBus from '../common/eventBus'
  import { CommentItemInfo } from '../common/types';

  export default defineComponent ({
    name: "Comment Submit Box",
    data() {
      return {
        comment_content: "",
        user_id: 0
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
      onSubmit() {
        submitComment(this.article_id, this.user_id, this.comment_content, submitSuccessCb);
      }
    }
  });

  function submitSuccessCb(comment: CommentItemInfo) : void {
    eventBus.emit("addNewComment", comment);
  }
</script>

<template>
  <form>
    <textarea v-model="comment_content"></textarea>
    <br />
    <input type="text" v-model="user_id" />
    <button type="button" @click="onSubmit()">Submit</button>
  </form>
</template>

<style scoped>
  textarea {
    width: 100%;
    height: 10em
  }
</style>