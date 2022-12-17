import { defineStore } from "pinia";
import { deleteComment, submitCommentForUser, submitCommentForVisitor } from "../common/network";
import { CommentItemInfo, ErrorInfo } from "../common/types";

export enum CommentCUDType {
  Comment_Undef = 0,
  Comment_Create = 1,
  Comment_Update = 2,
  Comment_Delete = 3
};

export const useCommentCUDStore = defineStore(
  'comment_cud',
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
      },
      submitCommentForUser(
        article_id: number, 
        comment_content: string,
        success_cb?: (comment: CommentItemInfo) => void
      ) {
        submitCommentForUser(
          article_id,
          comment_content,
          (comment) => {
            if (success_cb) {
              this.comment = comment;
              this.type = CommentCUDType.Comment_Create;
              success_cb(comment);
            }
          }
        );
      },
      submitCommentForVisitor(
        article_id: number,
        user_name: string,
        user_email: string,
        comment_content: string,
        success_cb?: (comment: CommentItemInfo) => void,
        error_cb?: (response?: ErrorInfo) => void
      ) {
        submitCommentForVisitor(
          article_id, 
          user_name, 
          user_email,
          comment_content,
          (comment) => {
            if (success_cb) {
              this.comment = comment;
              this.type = CommentCUDType.Comment_Create;
              success_cb(comment);
            }
          },
          error_cb);
      }
    }
  }
)