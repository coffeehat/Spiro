export type ErrorInfo = {
  error_code: number,
  error_hint: string,
  error_msg: string
}

export type CommentItemInfo = {
  article_id: number,
  user_id: number,
  user_name: string,
  comment_id: number,
  comment_timestamp: string,
  comment_content: string,
  sub_comment_list: CommentItemInfo[]
  parent_comment_id: number,
  to_user_id: number,
  to_user_name: string
}

export type CommentItemInfoList = CommentItemInfo[];

export type UserLoginResponse = {
  token: string
  token_expire_timestamp: string,
  user_name: string,
  user_id: number,
  error_code: number,
  error_hint: string,
  error_msg: string,
}

export type TokenCheckResponse = ErrorInfo;
export type UserRegisterResponse = ErrorInfo;