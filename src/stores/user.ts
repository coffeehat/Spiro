import { defineStore } from "pinia";
import { genConfig } from "holiday-avatar";
import { UserCookies } from "../common/cookies";
import { checkToken, loginUser, logoutUser } from "../common/network";
import { ErrorInfo, TokenCheckResponse, UserLoginResponse } from "../common/types";
import { genAvatarConfigByUserId } from '../common/utils';

export const useUserStore = defineStore(
  'user',
  {
    state: () => {
      return {
        user_name: "",
        user_id: 0,
        is_valid: false,
      };
    },
    getters: {
      avatar_config: (state) => {
        if (state.is_valid) {
          return genConfig(genAvatarConfigByUserId(state.user_id) as any)
        }
      }
    },
    actions: {
      restoreFromCookies() {
        let user_cookies = UserCookies.retrieve_from_cookies();
        if (user_cookies) {
          checkToken(
            user_cookies.get_token(),
            (response: TokenCheckResponse) => {
              this.user_name = (user_cookies as UserCookies).get_user_name();
              this.user_id = (user_cookies as UserCookies).get_user_id();
              this.is_valid = true;
            }
          )
        }
      },
      logIn(
        user_name_or_email: string, 
        user_passwd: string,
        success_cb?: (response : UserLoginResponse) => void,
        error_cb?: (response?: ErrorInfo) => void
      ) {
        loginUser(user_name_or_email, user_passwd, 
          // success callback
          (response: UserLoginResponse) => {
            this.user_name = response.user_name;
            this.user_id = response.user_id;
            this.is_valid = true;
            if (success_cb) {
              success_cb(response);
            }
          }, 
          // error callback
          (response?: ErrorInfo) => {
            if (error_cb) {
              error_cb(response);
            }
          });
      },
      logOut() {
        logoutUser();
        this.is_valid = false;
      }
    }
  }
);