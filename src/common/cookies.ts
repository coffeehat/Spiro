import { useCookies } from "vue3-cookies";

import { convertTimestamp2JsDate } from "./utils";

const { cookies } = useCookies();

export class UserCookies {
  user_id: number;
  user_name: string;
  token: string;

  constructor(user_name: string, user_id: number, token: string) {
    this.user_name = user_name;
    this.user_id = user_id;
    this.token = token;
  }

  get_user_name() : string {
    return this.user_name;
  }

  get_token() : string {
    return this.token;
  }

  get_user_id() : number {
    return this.user_id;
  }

  static dump_to_cookies(user_cookies : UserCookies, expire_time_stamp : string) {
    let dt = convertTimestamp2JsDate(expire_time_stamp);
    // TODO: set cookies to a path
    cookies.set("user_name", user_cookies.get_user_name(), dt);
    cookies.set("user_id", user_cookies.get_user_id().toString(), dt);
    cookies.set("token", user_cookies.get_token(), dt);
  }

  static retrieve_from_cookies() : UserCookies | null {
    let user_name = cookies.get("user_name");
    let user_id = parseInt(cookies.get("user_id"));
    let token = cookies.get("token");
    if (user_name && token) {
      return new UserCookies(user_name, user_id, token);
    } else {
      return null;
    }
  }

  static delete_cookies() {
    cookies.remove("user_name");
    cookies.remove("token");
  }
};