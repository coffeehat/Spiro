import axios from 'axios';

import { CommentItemInfo, CommentItemInfoList } from './types';

export function getCommentList(
  article_id: number,
  success_cb?: (comment_list: CommentItemInfoList)=>void,
  error_cb?: (error:string)=>void
) {
  axios({
    method: 'get',
    url: "http://localhost:5000/v1.0/comment_list",
    params: {
      "article_id": article_id,
      "offset": 0,
      "length": 0
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
  user_name: string,
  user_email: string,
  comment: string,
  success_cb?: (comment: CommentItemInfo) => void,
  error_cb?: () => void
) {
  let form = new FormData();
  form.append("article_id", article_id.toString());
  form.append("user_name", user_name);
  form.append("user_email", user_email);
  form.append("comment_content", comment);

  axios({
    method: 'post',
    url: "http://localhost:5000/v1.0/comment",
    data: form,
    auth: {
      username: "",
      password: ""
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