<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup

import CommentSubmitBox from './components/CommentSubmitBox.vue';
import CommentListBox from './components/CommentListBox.vue'

</script>

<template>
  <CommentSubmitBox :article_id="0"/>
  <CommentListBox :article_id="0"/>
</template>

<style scoped>

</style>
