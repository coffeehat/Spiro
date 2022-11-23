<script lang="ts">
  import { defineComponent } from 'vue';
  import axios from 'axios';

  export default defineComponent ({
    name: "Comment Box",
    data() {
      return {
        comment_content: ""
      }
    },
    props:
    {
      article_id:
      {
        type: Number,
      }
    },
    methods: {
      onSubmit() {
        console.log(this.article_id);
        axios({
          method: 'post',
          url: "http://localhost:5000/v1.0/comment",
          data: {
            "article_id": this.article_id,
            "comment": this.comment_content
          }
      }).then(
          response => console.log(response)
        ).catch(
          error => console.log(error)
        )
      }
    }
  });
</script>

<template>
  <form>
    <textarea v-model="comment_content"></textarea>
    <br />
    <button type="button" @click="onSubmit()">Submit</button>
  </form>
</template>

<style scoped>
  textarea {
    width: 100%;
    height: 10em
  }
</style>