import { defineStore } from "pinia";
import { CommentItemInfo } from "../common/types";

export enum CommentCUDType {
  Comment_Undef = 0,
  Comment_Create = 1,
  Comment_Update = 2,
  Comment_Delete = 3
};

export const useCommentCUDStore = defineStore(
  'comment_temp',
  {
    state: () => {
      return {
        comment: {} as CommentItemInfo,
        type: CommentCUDType.Comment_Undef
      }
    }
  }
)