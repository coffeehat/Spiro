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

import { SpiroConfig } from '../config';

export enum CommentListGetMethod {
  COUNT_FROM_OFFSET = 0,
  COUNT_FROM_COMMENT_ID = 1
}

export function getCommentList(
  article_uuid: string,
  primary_comment_count: number,
  sub_comment_count: number,
  method: CommentListGetMethod,
  primary_start_comment_offset: number,
  primary_start_comment_id: number,
  is_newer: boolean,
  success_cb?: (comment_list: CommentItemInfoList, is_more_old: boolean, is_more_new: boolean) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  axios({
    method: 'get',
    url: SpiroConfig.server_addr + "/v1.0/comment_list",
    params: {
      "article_uuid": article_uuid,
      "primary_start_comment_offset": primary_start_comment_offset,
      "primary_comment_count": primary_comment_count,
      "sub_comment_count": sub_comment_count,
      "method": method,
      "primary_start_comment_id": primary_start_comment_id,
      "is_newer": is_newer
    }
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(response.data.comment_list, response.data.is_more_old, response.data.is_more_new);
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
  article_uuid: string,
  parent_comment_id: number,
  sub_comment_count: number,
  method: CommentListGetMethod,
  sub_start_comment_offset: number,
  sub_start_comment_id: number,
  is_newer: boolean,
  success_cb?: (comment_list: SubCommentItemInfoList, is_more_old: boolean, is_more_new: boolean) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  axios({
    method: 'get',
    url: SpiroConfig.server_addr + "/v1.0/sub_comment_list",
    params: {
      "article_uuid": article_uuid,
      "parent_comment_id": parent_comment_id,
      "method": method,
      "sub_start_comment_offset": sub_start_comment_offset,
      "sub_comment_count": sub_comment_count,
      "sub_start_comment_id": sub_start_comment_id,
      "is_newer": is_newer
    }
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(response.data.sub_comment_list, response.data.is_more_old, response.data.is_more_new);
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

export function getAnchorCommentList(
  article_uuid: string,
  anchor: string,
  primary_single_side_comment_count: number,
  sub_comment_count: number,
  sub_single_side_comment_count: number,
  success_cb?: (comment_list: SubCommentItemInfoList, is_more_old: boolean, is_more_new: boolean) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  axios({
    method: 'get',
    url: SpiroConfig.server_addr + "/v1.0/anchor_comment_list",
    params: {
      "article_uuid": article_uuid,
      "anchor": anchor,
      "primary_single_side_comment_count": primary_single_side_comment_count,
      "sub_comment_count": sub_comment_count,
      "sub_single_side_comment_count": sub_single_side_comment_count
    }
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(response.data.comment_list, response.data.is_more_old, response.data.is_more_new);
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
  article_uuid: string,
  user_name: string,
  user_email: string,
  comment: string,
  parent_comment_id : number,
  to_user_id: number,
  to_user_name: string,
  url: string,
  success_cb?: (comment: CommentItemInfo) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("article_uuid", article_uuid);
  form.append("user_name", user_name);
  form.append("user_email", user_email);
  form.append("comment_content", comment);
  form.append("parent_comment_id", parent_comment_id.toString());
  form.append("to_user_id", to_user_id.toString());
  form.append("to_user_name", to_user_name.toString());
  form.append("url", url);

  axios({
    method: 'post',
    url: SpiroConfig.server_addr + "/v1.0/comment",
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
  article_uuid: string,
  comment: string,
  parent_comment_id : number,
  to_user_id: number,
  to_user_name: string,
  url: string,
  success_cb?: (comment: CommentItemInfo) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("article_uuid", article_uuid);
  form.append("comment_content", comment);
  form.append("parent_comment_id", parent_comment_id.toString());
  form.append("to_user_id", to_user_id.toString());
  form.append("to_user_name", to_user_name.toString());
  form.append("url", url);

  let user_cookies = UserCookies.retrieve_from_cookies();
  if (!user_cookies) {
    if (error_cb) {
      error_cb();
    }
  }

  axios({
    method: 'post',
    url: SpiroConfig.server_addr + "/v1.0/comment",
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
    url: SpiroConfig.server_addr + "/v1.0/user",
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
    url: SpiroConfig.server_addr + "/v1.0/user",
    data: form
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        // showSuccessMessage("注册成功！");
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
    url: SpiroConfig.server_addr + "/v1.0/token_check",
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
  article_uuid: string,
  success_cb?: (comment_list: number) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  axios({
    method: 'get',
    url: SpiroConfig.server_addr + "/v1.0/comment_count",
    params: {
      "article_uuid": article_uuid
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

export enum CommentDeleteType {
  DELETE_UNDEFINED = 0,
  DELETE_DIRECTLY = 1,
  DELETE_BY_MARK = 2,
  DELETE_DIRECTLY_WITH_PARENT = 3
}

export function deleteComment(
  comment_id: number,
  is_primary: boolean,
  success_cb?: (comment_id: number, deleteType: CommentDeleteType) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("comment_id", comment_id.toString())
  form.append("is_primary", is_primary.toString())

  let user_cookies = UserCookies.retrieve_from_cookies();
  axios({
    method: 'delete',
    url: SpiroConfig.server_addr + "/v1.0/comment",
    data: form,
    headers: {
      Authorization: `Bearer ${user_cookies?.get_token()}`
    }
  }).then(
    (response) => {
      if (response.data.error_code == ServerErrorCode.EC_SUCCESS) {
        if (success_cb) {
          success_cb(comment_id, response.data.delete_type);
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

export function updateArticleReadCount(
  article_uuid: string,
  article_link: string,
  article_name: string,
  success_cb?: (count: number) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  let form = new FormData();
  form.append("article_uuid", article_uuid);
  form.append("article_link", article_link);
  form.append("article_name", article_name);

  axios({
    method: 'post',
    url: SpiroConfig.server_addr + "/v1.0/article_read_count",
    data: form
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

export function getArticleReadCount(
  article_uuid: string,
  article_link: string,
  article_name: string,
  success_cb?: (comment_list: number) => void,
  error_cb?: (response?: ErrorInfo) => void
) {
  axios({
    method: 'get',
    url: SpiroConfig.server_addr + "/v1.0/article_read_count",
    params: {
      "article_uuid": article_uuid,
      "article_link": article_link,
      "article_name": article_name
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
