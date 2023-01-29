import axios from 'axios';

import { UserCookies } from './cookies';
import { ServerErrorCode, parseAndShowErrorInfo } from './errors';
import {
  CommentItemInfo,
  CommentItemInfoList,
  SubCommentItemInfoList,
  UserLoginResponse,
  UserRegisterResponse,
  ErrorInfo,
  TokenCheckResponse
} from './types';
import { showSuccessMessage } from './utils';

var server_addr = "http://127.0.0.1:5000";

export function updateServerAddress(addr: string) {
  server_addr = addr;
}

export function getCommentList(
  article_id: number,
  primary_comment_offset: number,
  primary_comment_count: number,
  sub_comment_count: number,
  success_cb?: (comment_list: CommentItemInfoList, is_more: boolean) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  axios({
    method: 'get',
    url: server_addr + "/v1.0/comment_list",
    params: {
      "article_id": article_id,
      "primary_comment_offset": primary_comment_offset,
      "primary_comment_count": primary_comment_count,
      "sub_comment_count": sub_comment_count
    }
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(response.data.comment_list, response.data.is_more);
        }
      } else {
        parseAndShowErrorInfo(response.data);
        if (error_cb) {
          error_cb(response.data);
        }
      }
    }
  ).catch(
    (error) => {
      parseAndShowErrorInfo(error.response.data);
      if (error_cb) {
        error_cb(error.response.data);
      }
    }
  );
}

export function getSubCommentList(
  article_id: number,
  parent_comment_id: number,
  sub_comment_offset: number,
  sub_comment_count: number,
  success_cb?: (comment_list: SubCommentItemInfoList, is_more: boolean) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  axios({
    method: 'get',
    url: server_addr + "/v1.0/sub_comment_list",
    params: {
      "article_id": article_id,
      "parent_comment_id": parent_comment_id,
      "sub_comment_offset": sub_comment_offset,
      "sub_comment_count": sub_comment_count
    }
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(response.data.sub_comment_list, response.data.is_more);
        }
      } else {
        parseAndShowErrorInfo(response.data);
        if (error_cb) {
          error_cb(response.data);
        }
      }
    }
  ).catch(
    (error) => {
      parseAndShowErrorInfo(error.response.data);
      if (error_cb) {
        error_cb(error.response.data);
      }
    }
  );
}

export function submitCommentForVisitor(
  article_id: number,
  user_name: string,
  user_email: string,
  comment: string,
  parent_comment_id : number,
  to_user_id: number,
  to_user_name: string,
  success_cb?: (comment: CommentItemInfo) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("article_id", article_id.toString());
  form.append("user_name", user_name);
  form.append("user_email", user_email);
  form.append("comment_content", comment);
  form.append("parent_comment_id", parent_comment_id.toString());
  form.append("to_user_id", to_user_id.toString());
  form.append("to_user_name", to_user_name.toString());

  axios({
    method: 'post',
    url: server_addr + "/v1.0/comment",
    data: form,
    auth: {
      username: "",
      password: ""
    }
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(response.data);
        }
      } else {
        parseAndShowErrorInfo(response.data);
        if (error_cb) {
          error_cb(response.data);
        }
      }
    }
  ).catch(
    (error) => {
      parseAndShowErrorInfo(error.response.data);
      if (error_cb) {
        error_cb(error.response.data);
      }
    }
  );
}

export function submitCommentForUser(
  article_id: number,
  comment: string,
  parent_comment_id : number,
  to_user_id: number,
  to_user_name: string,
  success_cb?: (comment: CommentItemInfo) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("article_id", article_id.toString());
  form.append("comment_content", comment);
  form.append("parent_comment_id", parent_comment_id.toString());
  form.append("to_user_id", to_user_id.toString());
  form.append("to_user_name", to_user_name.toString());

  let user_cookies = UserCookies.retrieve_from_cookies();
  if (!user_cookies) {
    if (error_cb) {
      error_cb();
    }
  }

  axios({
    method: 'post',
    url: server_addr + "/v1.0/comment",
    data: form,
    headers: {
      Authorization: `Bearer ${user_cookies?.get_token()}`
    }
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(response.data);
        }
      } else {
        parseAndShowErrorInfo(response.data);
        if (error_cb) {
          error_cb(response.data);
        }
      }
    }
  ).catch(
    (error) => {
      parseAndShowErrorInfo(error.response.data);
      if (error_cb) {
        error_cb(error.response.data);
      }
    }
  );
}

export function logoutUser() {
  UserCookies.delete_cookies();
}

export function loginUser(
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
    url: server_addr + "/v1.0/user",
    data: form
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        let user_cookies = new UserCookies(response.data.user_name, response.data.user_id, response.data.token);
        UserCookies.dump_to_cookies(user_cookies, response.data.token_expire_timestamp);
        if (success_cb) {
          success_cb(response.data);
        }
      } else {
        parseAndShowErrorInfo(response.data);
        if (error_cb) {
          error_cb(response.data);
        }
      }
    }
  ).catch(
    (error) => {
      parseAndShowErrorInfo(error.response.data);
      if (error_cb) {
        error_cb(error.response.data);
      }
    }
  );
}

export function registerUser(
  user_name: string,
  user_email: string,
  user_passwd: string,
  success_cb?: (response: UserRegisterResponse) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("method", "register");
  form.append("user_name", user_name);
  form.append("user_email", user_email);
  form.append("user_passwd", user_passwd);

  axios({
    method: 'post',
    url: server_addr + "/v1.0/user",
    data: form
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        showSuccessMessage("注册成功！");
        if (success_cb) {
          success_cb(response.data);
        }
      } else {
        parseAndShowErrorInfo(response.data);
        if (error_cb) {
          error_cb(response.data);
        }
      }
    }
  ).catch(
    (error) => {
      parseAndShowErrorInfo(error.response.data);
      if (error_cb) {
        error_cb(error.response.data);
      }
    }
  );
}

export function checkToken(
  token: string,
  success_cb?: (response: TokenCheckResponse) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("token", token)

  axios({
    method: 'post',
    url: server_addr + "/v1.0/token_check",
    data: form
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(response.data);
        }
      } else {
        UserCookies.delete_cookies();
        parseAndShowErrorInfo(response.data);
        if (error_cb) {
          error_cb(response.data);
        }
      }
    }
  ).catch(
    (error) => {
      UserCookies.delete_cookies();
      parseAndShowErrorInfo(error.response.data);
      if (error_cb) {
        error_cb(error.response.data);
      }
    }
  );
}

export function getCommentCount(
  article_id: number,
  success_cb?: (comment_list: number) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  axios({
    method: 'get',
    url: server_addr + "/v1.0/comment_count",
    params: {
      "article_id": article_id
    }
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(response.data.count);
        }
      } else {
        parseAndShowErrorInfo(response.data);
        if (error_cb) {
          error_cb(response.data);
        }
      }
    }
  ).catch(
    (error) => {
      parseAndShowErrorInfo(error.response.data);
      if (error_cb) {
        error_cb(error.response.data);
      }
    }
  );
}

export function deleteComment(
  comment_id: number,
  success_cb?: (comment_id: number) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("comment_id", comment_id.toString())

  let user_cookies = UserCookies.retrieve_from_cookies();
  axios({
    method: 'delete',
    url: server_addr + "/v1.0/comment",
    data: form,
    headers: {
      Authorization: `Bearer ${user_cookies?.get_token()}`
    }
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(comment_id);
        }
      } else {
        parseAndShowErrorInfo(response.data);
        if (error_cb) {
          error_cb(response.data);
        }
      }
    }
  ).catch(
    (error) => {
      parseAndShowErrorInfo(error.response.data);
      if (error_cb) {
        error_cb(error.response.data);
      }
    }
  );
}