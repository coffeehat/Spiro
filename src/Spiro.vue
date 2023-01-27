<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup

import CommentSubmitBox from './components/CommentSubmitBox.vue';
import CommentListBox from './components/CommentListBox.vue';

import { onBeforeMount } from 'vue';

import { useUserStore } from './stores';

const userStore = useUserStore();

onBeforeMount(() => {
  userStore.restoreFromCookies();
});
</script>

<template>
  <div class="container">
    <CommentSubmitBox class="submitbox" :article_id="0" :is_hide_user_ctrl_box_at_first="true" :comment_list_to_affect="0"/>
    <CommentListBox class="listbox" :article_id="0"/>
  </div>
</template>

<style scoped>
  @media screen and (min-width: 718px) {
    .container {
      max-width: 1000px;
      margin-left: auto;
      margin-right: auto;
    }
  }

  .container >>> .submitbox,
  .container >>> .listbox {
    font-family: "-apple-system", "Microsoft Yahei", sans-serif;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    color: rgb(22, 22, 22);
    font-size: 14px;

    box-sizing: border-box;
  }
</style>
