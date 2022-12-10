import axios from 'axios';

import { UserCookies } from './cookies';
import { ServerErrorCode } from './errors';
import {
  CommentItemInfo,
  CommentItemInfoList,
  UserLoginResponse,
  ErrorInfo
} from './types';

export function getCommentList(
  article_id: number,
  success_cb?: (comment_list: CommentItemInfoList)=>void,
  error_cb?: (response?: ErrorInfo)=>void
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

export function submitCommentForVisitor (
  article_id: number,
  user_name: string,
  user_email: string,
  comment: string,
  success_cb?: (comment: CommentItemInfo) => void,
  error_cb?: (response?: ErrorInfo) => void
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

export function submitCommentForUser (
  article_id: number,
  comment: string,
  success_cb?: (comment: CommentItemInfo) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("article_id", article_id.toString());
  form.append("comment_content", comment);

  let user_cookies = UserCookies.retrieve_from_cookies();
  if (!user_cookies) {
    if (error_cb) {
      error_cb();
    }
  }

  axios({
    method: 'post',
    url: "http://localhost:5000/v1.0/comment",
    data: form,
    headers: {
      Authorization: `Bearer ${user_cookies?.get_token()}`
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

export function loginUser (
  user_name_or_email: string,
  user_passwd: string,
  success_cb?: (response: UserLoginResponse) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("method", "login");
  form.append("user_name", user_name_or_email);
  form.append("user_email", "");
  form.append("user_passwd", user_passwd);

  axios({
    method: 'post',
    url: "http://localhost:5000/v1.0/user",
    data: form
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        let user_cookies = new UserCookies(response.data.user_name, response.data.token);
        UserCookies.dump_to_cookies(user_cookies, response.data.token_expire);
        if (success_cb) {
          success_cb(response.data);
        }
      } else {
        if (error_cb) {
          error_cb(response.data);
        }
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