<script lang="ts">
  import { defineComponent } from 'vue';

  // libs
  import { submitComment } from '../common/network';
  import { marked } from '../common/markdown'
  import eventBus from '../common/eventBus'
  import { CommentItemInfo } from '../common/types';

  export default defineComponent ({
    name: "Comment Submit Box",
    data() {
      return {
        comment_content: "",
        user_name: "",
        user_email: "",
        md_preview: "",
        isShowPreview: false,
        preview_button_content: "to Preview"
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
        submitComment(this.article_id, this.user_name, this.user_email, this.comment_content, submitSuccessCb);
      },
      onPreview() {
        if (this.isShowPreview) {
          this.isShowPreview = !this.isShowPreview;
          this.md_preview = "";
          this.preview_button_content = "to Preview"
        } else {
          this.md_preview = marked.parse(this.comment_content);
          this.isShowPreview = !this.isShowPreview;
          this.preview_button_content = "back to Editor"
        }
      }
    }
  });

  function submitSuccessCb(comment: CommentItemInfo) : void {
    eventBus.emit("addNewComment", comment);
  }
</script>

<template>
  <form>
    <div class="comment_submit_container">
      <textarea class="comment_textarea" v-model="comment_content" v-show="!isShowPreview"></textarea>
      <div class="comment_preview" v-html="md_preview" v-show="isShowPreview"></div>
    </div>
    <span>昵称：</span>
    <input type="text" v-model="user_name"/>
    <span>邮箱：</span>
    <input type="text" placeholder="Optional" v-model="user_email"/>
    <button type="button" @click="onSubmit()">Submit</button>
    <button type="button" @click="onPreview()">{{ preview_button_content }}</button>
  </form>
</template>

<style scoped>
  .comment_submit_container {
    margin-bottom: 10px;
  }
  .comment_textarea {
    width: 100%;
    min-height: 10rem;
    border-radius: 15px;
    padding: 10px;
    display: block;
  }
  .comment_preview {
    width: 100%;
    min-height: 10rem;
    /* background-color: white; */
    outline: 1px solid black;
    border-radius: 15px;
    padding:10px;
  }
</style>