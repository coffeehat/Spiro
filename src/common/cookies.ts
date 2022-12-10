import { useCookies } from "vue3-cookies";

import { convertTimestamp2CookieExpireTime } from "./utils";

const { cookies } = useCookies();

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

  static dump_to_cookies(user_cookies : UserCookies, expire_time : number) {
    cookies.set("user_name", user_cookies.get_user_name(), expire_time.toString() + "s");
    cookies.set("token", user_cookies.get_token(), expire_time.toString() + "s");
  }

  static retrieve_from_cookies() : UserCookies | null {
    let user_name = cookies.get("user_name");
    let token = cookies.get("token");
    if (user_name && token) {
      return new UserCookies(user_name, token);
    } else {
      return null;
    }
  }

  static delete_cookies() {
    cookies.remove("user_name");
    cookies.remove("token");
  }
};