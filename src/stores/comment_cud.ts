import { defineStore } from "pinia";
import { deleteComment } from "../common/network";
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
    },
    actions: {
      delete(comment_id: number) {
        deleteComment(
          comment_id,
          (comment_id) => {
            this.comment.comment_id = comment_id;
            this.type = CommentCUDType.Comment_Delete;
          }
        );
      }
    }
  }
)