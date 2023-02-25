import { defineStore } from "pinia";
import { ServerErrorCode } from "../common/errors";
import { deleteComment, submitCommentForUser, submitCommentForVisitor, CommentDeleteType } from "../common/network";
import { CommentItemInfo, ErrorInfo } from "../common/types";
import { useUserStore } from "./user";

function check_and_handle_token_invalid_error(error?: ErrorInfo) {
  const userStore = useUserStore();
  if (error
    && (error.error_code == ServerErrorCode.EC_USER_LOGIN_TOKEN_EXPIRED
    || error.error_code == ServerErrorCode.EC_USER_LOGIN_TOKEN_SIGN_ERROR)
  ) {
    userStore.is_valid = false;
  }
}

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
        type: CommentCUDType.Comment_Undef,
        list_obj: {} as any,
        delete_type: CommentDeleteType.DELETE_UNDEFINED,
        delete_primary: true
      }
    },
    actions: {
      delete(
        comment_id: number,
        is_primary: boolean,
        list_obj?: any
      ) {
        deleteComment(
          comment_id,
          is_primary,
          (comment_id, delete_type) => {
            this.comment.comment_id = comment_id;
            this.type = CommentCUDType.Comment_Delete;
            this.list_obj = list_obj;
            this.delete_type = delete_type;
            this.delete_primary = is_primary;
          },
          check_and_handle_token_invalid_error
        );
      },
      submitCommentForUser(
        article_uuid: string, 
        comment_content: string,
        parent_comment_id : number,
        to_user_id: number,
        to_user_name: string,
        url: string,
        success_cb?: (comment: CommentItemInfo) => void,
        list_obj?: any
      ) {
        submitCommentForUser(
          article_uuid,
          comment_content,
          parent_comment_id,
          to_user_id,
          to_user_name,
          url,
          (comment) => {
            if (success_cb) {
              this.comment = comment;
              this.type = CommentCUDType.Comment_Create;
              this.list_obj = list_obj;
              success_cb(comment);
            }
          },
          check_and_handle_token_invalid_error
        );
      },
      submitCommentForVisitor(
        article_uuid: string,
        user_name: string,
        user_email: string,
        comment_content: string,
        parent_comment_id : number,
        to_user_id: number,
        to_user_name: string,
        url: string,
        success_cb?: (comment: CommentItemInfo) => void,
        error_cb?: (response?: ErrorInfo) => void,
        list_obj?: any
      ) {
        submitCommentForVisitor(
          article_uuid, 
          user_name, 
          user_email,
          comment_content,
          parent_comment_id,
          to_user_id,
          to_user_name,
          url,
          (comment) => {
            if (success_cb) {
              this.comment = comment;
              this.type = CommentCUDType.Comment_Create;
              this.list_obj = list_obj;
              success_cb(comment);
            }
          },
          error_cb);
      }
    }
  }
)