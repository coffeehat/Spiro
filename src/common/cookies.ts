import { convertTimestamp2CookieExpireTime } from "./utils";

export class UserCookies {
  user_name: string;
  token: string;

  constructor(user_name: string, token: string) {
    this.user_name = user_name;
    this.token = token;
  }

  get_user_name() : string {
    return this.user_name;
  }

  get_token() : string {
    return this.token;
  }

  static dump_to_cookies(user_cookies : UserCookies, expire_timestamp : string) {
    saveCookies("user_name", user_cookies.get_user_name(), expire_timestamp);
    saveCookies("token", user_cookies.get_token(), expire_timestamp);
  }

  static retrieve_from_cookies() : UserCookies | null {
    let user_name = getCookies("user_name");
    let token = getCookies("token");
    if (user_name && token) {
      return new UserCookies(user_name, token);
    } else {
      return null;
    }
  }

  static delete_cookies() {
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

function checkCookies(key : string) : boolean{
  let ret = getCookies(key);
  return Boolean(ret);
}

function getCookies(key : string) : string | null {
  let cookie_string = document.cookie;
  if (cookie_string.length == 0) {
    return null;
  }
  let cookie_key_value_list = cookie_string.split(";");
  for (let entry in cookie_key_value_list) {
    if (entry.length == 0) {
      continue;
    }
    let index = entry.indexOf("=");
    if (index > 0) {
      let cookie_key = entry.slice(0, index);
      let cookie_value = entry.slice(index + 1);
      if (cookie_key == key) {
        return cookie_value;
      }
    }
  }
  return null;
};

function saveCookies(key : string, value: string, expire_timestamp?: string) {
  let key_string = key + "=" + value;
  if (expire_timestamp) {
    let expire_string = "expires=" + convertTimestamp2CookieExpireTime(expire_timestamp);
    document.cookie = key_string + "; " + expire_string;
  } else {
    document.cookie = key_string + "; ";
  }
}