import axios from 'axios';

import { CommentItemInfo } from './types';

export function getCommentList(
  article_id: number,
  success_cb?: (comment_list: CommentItemInfo[])=>void,
  error_cb?: (error:string)=>void
) {
  axios({
    method: 'get',
    url: "http://localhost:5000/v1.0/comment_list",
    params: {
      "article_id": article_id,
      "range_start": 0,
      "range_end": -1
    }
  }).then(
    (response) => {
      if (success_cb) {
        success_cb(response.data.comment_list);
      }
    }
  ).catch(
    (error) => {
      if (error_cb) {
        error_cb(error);
      }
    }
  )
}

export function submitComment (
  article_id: number,
  user_id: number,
  comment: string,
  success_cb?: (comment: CommentItemInfo) => void,
  error_cb?: () => void
) {
  axios({
    method: 'post',
    url: "http://localhost:5000/v1.0/comment",
    data: {
      "article_id": article_id,
      "user_id": user_id,
      "comment": comment
    }
  }).then(
    (response) => {
      if (success_cb) {
        success_cb(response.data);
      }
    }
  ).catch(
    (error) => {
      if (error_cb) {
        error_cb();
      }
    }
  )
}