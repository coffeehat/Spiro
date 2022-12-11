import { ElMessage } from 'element-plus';

import { ErrorInfo } from "./types";
import { showErrorMessage } from './utils';

export enum ServerErrorCode {
  // Generics
  EC_CLIENT_ERROR = -1,
  EC_SUCCESS = 0,
  EC_GENERIC_ERROR = 1,
  EC_INTERNAL_ERROR = 2,

  // Argument Error
  EC_ARG_GENERIC_ERROR = 100,
  EC_ARG_INVALID_ERROR = 101,
  EC_ARG_NOUSERNAME_ERROR = 102,
  EC_ARG_NOEMAIL_BUT_HASPASSWD_ERROR = 103,
  EC_ARG_EMPTY_COMMENT = 104,

  // Database Error
  EC_DB_GENERIC_ERROR = 200,
  EC_DB_NOT_FOUND_ERROR = 201,
  
  // User Error
  EC_USER_GENERIC_ERROR = 300,

  EC_USER_REG_ERROR = 301,
  EC_USER_REG_DUP_NAME_ERROR = 302,
  EC_USER_REG_DUP_EMAIL_ERROR = 303,
  EC_USER_REG_DUP_BOTH_NAME_EMAIL_ERROR = 304,

  EC_VISITOR_REG_DUP_BOTH_NAME_EMAIL_WITH_MEMBER_ERROR = 305,
  EC_VISITOR_REG_DUP_NAME_WITH_MEMBER_DUP_EMAIL_WITH_VISITOR = 306,
  EC_VISIOTR_REG_DUP_EMAIL_WITH_MEMBER = 307,
  EC_VISITOR_REG_DUP_NAME_WITH_VISITOR_DUP_EMAIL_WITH_MEMBER = 308,
  EC_VISIOTR_REG_DUP_EMAIL_WITH_VISITOR = 309,
  EC_VISIOTR_REG_DUP_BOTH_NAME_EMAIL_WITH_VISITOR_ERROR = 310,
  EC_VISITOR_REG_DUP_NAME_WITH_MEMBER = 311,

  EC_USER_LOGIN_ERROR = 350,
  EC_USER_LOGIN_TOKEN_EXPIRED = 351,
  EC_USER_LOGIN_TOKEN_SIGN_ERROR = 352,
  EC_USER_LOGIN_AS_VISITOR_ERROR = 353,

  EC_VISITOR_LOGIN_ERROR = 370,
  EC_VISITOR_LOGIN_NEED_EMAIL = 371,
  EC_VISITOR_LOGIN_NAME_CONLICT_WITH_MEMBER = 372,
  EC_VISITOR_LOGIN_UNMATCHED_EMIAL_WITH_NAME = 373,
  EC_VISITOR_LOGIN_NEED_PASSWD_AUTHENTICATION = 374,

  EC_USER_UNAUTHORIZED_ERROR = 399,
}

enum UserRole {
  Admin = 0,
  Member = 10,
  Visitor = 100,
}

function getRoleName(role : UserRole) : string {
  if (role >= UserRole.Visitor) {
    return "游客";
  } else {
    return "用户";
  }
}

const error_code_parser_collections = {
  [ServerErrorCode.EC_CLIENT_ERROR]:
    (error_hint? : any) => { return "网页错误"; },
  [ServerErrorCode.EC_SUCCESS] : 
    (error_hint? : any) => { return "成功"; },
  [ServerErrorCode.EC_GENERIC_ERROR] : 
    (error_hint? : any) => { return "一般错误"; },
  [ServerErrorCode.EC_INTERNAL_ERROR] : 
    (error_hint? : any) => { return "服务器内部错误"; },
  [ServerErrorCode.EC_ARG_GENERIC_ERROR] : 
    (error_hint? : any) => { return "请求参数一般错误"; },
  [ServerErrorCode.EC_ARG_INVALID_ERROR] : 
    (error_hint? : any) => { return "请求参数无效"; },
  [ServerErrorCode.EC_ARG_NOUSERNAME_ERROR] : 
    (error_hint? : any) => { return "未提供用户名"; },
  [ServerErrorCode.EC_ARG_NOEMAIL_BUT_HASPASSWD_ERROR] : 
    (error_hint? : any) => { return "注册必须提供邮箱"; },
  [ServerErrorCode.EC_ARG_EMPTY_COMMENT] :
    (error_hint? : any) => { return "评论不可为空"; },
  [ServerErrorCode.EC_DB_GENERIC_ERROR] : 
    (error_hint? : any) => { return "数据库一般错误"; },
  [ServerErrorCode.EC_DB_NOT_FOUND_ERROR] : 
    (error_hint? : any) => { return "未在数据库中检索到用户提交的信息"; },
  [ServerErrorCode.EC_USER_GENERIC_ERROR] : 
    (error_hint? : any) => { return "用户一般错误"; },
  [ServerErrorCode.EC_USER_REG_ERROR] : 
    (error_hint? : any) => { return "用户注册错误"; },
  [ServerErrorCode.EC_USER_REG_DUP_NAME_ERROR] : 
    (error_hint? : any) => { return "用户提供的用户名被占用"; },
  [ServerErrorCode.EC_USER_REG_DUP_EMAIL_ERROR] : 
    (error_hint? : any) => {
      if (error_hint) { return `${getRoleName(error_hint['dup.name'].user_role)}“${error_hint['dup.name'].user_name}”也占用了该邮箱`; }
      else { return "用户提供的邮箱被占用"; }},
  [ServerErrorCode.EC_USER_REG_DUP_BOTH_NAME_EMAIL_ERROR] : 
    (error_hint? : any) => {
      if (error_hint) { return `你输入的用户名被其他正式用户占用；同时你输入的邮箱被${getRoleName(error_hint['dup.name'].user_role)}"${error_hint['dup.name'].user_name}"占用`; }
      else { return "用户提供的名称和邮箱都被占用"; }},
  [ServerErrorCode.EC_VISITOR_REG_DUP_BOTH_NAME_EMAIL_WITH_MEMBER_ERROR] :
    (error_hint? : any) => { return "游客名和邮箱分别被两个正式用户占用"; },
  [ServerErrorCode.EC_VISITOR_REG_DUP_NAME_WITH_MEMBER_DUP_EMAIL_WITH_VISITOR] :
    (error_hint? : any) => {
      if (error_hint) { return `你输入的游客名被其他正式用户占用；同时你输入的邮箱被${getRoleName(error_hint['dup.name'].user_role)}"${error_hint['dup.name'].user_name}"占用`; }
      else { return "游客提供的名称和邮箱都被占用"; }},
  [ServerErrorCode.EC_VISIOTR_REG_DUP_EMAIL_WITH_MEMBER] :
    (error_hint? : any) => { return "游客邮箱被正式用户占用" },
  [ServerErrorCode.EC_VISITOR_REG_DUP_NAME_WITH_VISITOR_DUP_EMAIL_WITH_MEMBER] :
    (error_hint? : any) => { return "游客名称被其他游客占用，同时邮箱被正式用户占用"; },
  [ServerErrorCode.EC_VISIOTR_REG_DUP_EMAIL_WITH_VISITOR] :
    (error_hint? : any) => {
      if (error_hint) { return `${getRoleName(error_hint['dup.name'].user_role)}“${error_hint['dup.name'].user_name}”也占用了该邮箱`; }
      else { return "用户提供的邮箱被占用"; }},
  [ServerErrorCode.EC_VISIOTR_REG_DUP_BOTH_NAME_EMAIL_WITH_VISITOR_ERROR] :
    (error_hint? : any) => {
      if (error_hint) { return `你输入的用户名被其他游客占用；同时你输入的邮箱被${getRoleName(error_hint['dup.name'].user_role)}"${error_hint['dup.name'].user_name}"占用`; }
      else { return "用户提供的名称和邮箱都被占用"; }},
  [ServerErrorCode.EC_VISITOR_REG_DUP_NAME_WITH_MEMBER] :
    (error_hint? : any) => { return "游客提供的游客名被正式用户占用"; },
  [ServerErrorCode.EC_USER_LOGIN_ERROR] : 
    (error_hint? : any) => { return "用户名或密码错误"; },
  [ServerErrorCode.EC_USER_LOGIN_TOKEN_EXPIRED] : 
    (error_hint? : any) => { return "用户凭据过期"; },
  [ServerErrorCode.EC_USER_LOGIN_TOKEN_SIGN_ERROR] : 
    (error_hint? : any) => { return "用户凭据非本服务器签发"; },
  [ServerErrorCode.EC_USER_LOGIN_AS_VISITOR_ERROR] :
    (error_hint? : any) => { return "此账户为游客，游客只有注册成为正式用户才可登录"; },
  [ServerErrorCode.EC_VISITOR_LOGIN_ERROR] :
    (error_hint? : any) => { return "游客登录错误"; },
  [ServerErrorCode.EC_VISITOR_LOGIN_NEED_EMAIL] :
    (error_hint? : any) => { return "使用该游客名登录时邮箱不可为空"; },
  [ServerErrorCode.EC_VISITOR_LOGIN_NAME_CONLICT_WITH_MEMBER] :
    (error_hint? : any) => { return "游客名称被注册用户占用"; },
  [ServerErrorCode.EC_VISITOR_LOGIN_UNMATCHED_EMIAL_WITH_NAME] :
    (error_hint? : any) => { return "游客名称被其他游客占用，你必须填写与该名称匹配的邮箱才可评论"; },
  [ServerErrorCode.EC_VISITOR_LOGIN_NEED_PASSWD_AUTHENTICATION] :
    (error_hint? : any) => { return "该游客为正式用户，需要密码认证，请登录"; },
  [ServerErrorCode.EC_USER_UNAUTHORIZED_ERROR] : 
    (error_hint? : any) => { return "未授权"; }
}

export function parseErrorCode(error_code : number, error_hint : any) : string {
  let error_parser = error_code_parser_collections[error_code as ServerErrorCode];
  if (error_parser) {
    return error_parser(error_hint);
  } else {
    return error_code_parser_collections[ServerErrorCode.EC_CLIENT_ERROR](error_hint);
  }
}

export function parseAndShowErrorInfo(error? : ErrorInfo) {
  let error_hint;
  if (error) {
    error_hint = parseErrorCode(error.error_code, error.error_hint);
  } else {
    error_hint = error_code_parser_collections[ServerErrorCode.EC_CLIENT_ERROR]();
  }
  showErrorMessage(error_hint);
}