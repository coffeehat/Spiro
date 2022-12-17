import { defineStore } from "pinia";
import { CommentItemInfo } from "../common/types";

export const useNewCommentStore = defineStore(
  'new_comment',
  {
    state: () => {
      return {
        comment: {} as CommentItemInfo
      }
    }
  }
)