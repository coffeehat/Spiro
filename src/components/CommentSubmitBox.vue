<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { useUserStore, useCommentCUDStore, useReplyMutexStore, ReplyMutexScope } from '../stores';

import { marked } from '../common/markdown'
import {
  registerUser
} from '../common/network';
import {
  CommentItemInfo,
  UserLoginResponse,
  ErrorInfo,
  UserRegisterResponse
} from '../common/types';
import { ServerErrorCode } from '../common/errors';
import { isEmail, checkXSSAttack, showErrorMessage } from '../common/utils'

import MarkdownView from './MarkdownView.vue';

export default defineComponent({
  name: "Comment Submit Box",
  data() {
    return {
      userStore: useUserStore(),
      commentCudStore: useCommentCUDStore(),
      replyMutex: useReplyMutexStore(),
      reply_mutex_ctrl_mask: false,
      // UserInteractiveRelated
      isShowUserInteractive: !this.is_hide_user_ctrl_box_at_first,
      // Preview related
      md_preview: "",
      isShowPreview: false,
      preview_button_content: "to Preview",
      // Login related
      isShowLoginTab: false,
      // Comment related
      comment_content: "",
      // Input Length
      user_name_max_len: 20,
      user_email_max_len: 40,
      user_passwd_max_len: 60,
      // Form rules for Visitor
      visitor_rules: {
        user_name: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 1, max: this.user_name_max_len, message: `名字长度不能超过${this.user_name_max_len}`, trigger: "blur" },
          { validator: this.checkUserNameXSS, trigger: "blur"}
        ],
        user_email: [
          { validator: this.checkEmailAllowEmpty, trigger: "blur" }
        ]
      },
      comment_form: {
        user_name: "",
        user_email: ""
      },
      // Form rules for Login
      login_form: {
        user_passwd: "",
        user_name_or_email: ""
      },
      login_rules: {
        user_name_or_email: [
          { required: true, message: "请输入名称或邮箱", trigger: "blur" },
          // TODO: Give a validator here to validate the length of name or email
        ],
        user_passwd: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 1, max: this.user_email_passwd_len, message: `密码长度不能超过${this.user_passwd_max_len}`, trigger: "blur" }
        ]
      },
      // Login/Register Switch
      isLoginPanel: true,
      // Form rules for register
      register_form: {
        user_name: "",
        user_email: "",
        user_passwd: "",
        user_passwd_confirm: ""
      },
      register_rules: {
        user_name: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 1, max: this.user_name_max_len, message: `名字长度不能超过${this.user_name_max_len}`, trigger: "blur" },
          { validator: this.checkUserNameXSS, trigger: "blur"}
        ],
        user_email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { min: 1, max: this.user_email_max_len, message: `邮箱长度不能超过${this.user_email_max_len}`, trigger: "blur" },
          { validator: this.checkEmailAllowEmpty, trigger: "blur" }
        ],
        user_passwd: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 1, max: this.user_email_passwd_len, message: `密码长度不能超过${this.user_passwd_max_len}`, trigger: "blur" }
        ],
        user_passwd_confirm: [
          { required: true, message: "请输入确认密码", trigger: "blur" },
          { validator: this.checkConfirmPasswd, trigger: "blur" }
        ]
      },
      // Other css
      preview_height: {
        "min-height": "10rem"
      }
    };
  },
  computed: {
    login_register_title() {
      if (this.isLoginPanel) {
        return "登录";
      }
      else {
        return "注册";
      }
    }
  },
  props: {
    article_id: {
      type: Number,
      default: 0
    },
    parent_comment_id: {
      type: Number,
      default: 0
    },
    to_user_id: {
      type: Number,
      default: 0
    },
    to_user_name: {
      type: String,
      default: ""
    },
    is_hide_user_ctrl_box_at_first: {
      type: Boolean,
      default: false
    },
    is_show_logined_user: {
      type: Boolean,
      default: true
    },
    is_primary_submit_box: {
      type: Boolean,
      default: true
    },
    reply_scope: {
      type: Object as PropType<ReplyMutexScope>,
      default: ReplyMutexScope.Scope_All
    },
    comment_list_to_affect: null
  },
  methods: {
    onVisitorSubmit() {
      if (checkXSSAttack(this.comment_content)) {
        showErrorMessage("在用户输入中检测到XSS攻击");
      } else {
          (this.$refs.comment_form as any).validate((valid: boolean) => {
          if (valid) {
            this.commentCudStore.submitCommentForVisitor(
              this.article_id, 
              this.comment_form.user_name, 
              this.comment_form.user_email, 
              this.comment_content,
              this.parent_comment_id,
              this.to_user_id,
              this.to_user_name,
              this.submitSuccessCb, 
              this.submitErrorCb,
              this.comment_list_to_affect
            );
          }
        });
        this.reply_mutex_ctrl_mask = true;
        this.replyMutex.acquire(this.reply_scope);
      }
    },
    onUserSubmit() {
      if (checkXSSAttack(this.comment_content)) {
        showErrorMessage("在用户输入中检测到XSS攻击");
      } else {
        this.commentCudStore.submitCommentForUser(
          this.article_id,
          this.comment_content,
          this.parent_comment_id,
          this.to_user_id,
          this.to_user_name,
          this.submitSuccessCb,
          this.comment_list_to_affect
        );
        this.reply_mutex_ctrl_mask = true;
        this.replyMutex.acquire(this.reply_scope);
      }
    },
    onPreview() {
      this.preview_height["min-height"] = (this.$refs.comment_input as any).textarea.style.height;
      if (this.isShowPreview) {
        this.isShowPreview = !this.isShowPreview;
        this.md_preview = "";
        this.preview_button_content = "to Preview";
      }
      else {
        this.md_preview = marked.parse(this.comment_content);
        this.isShowPreview = !this.isShowPreview;
        this.preview_button_content = "back to Editor";
      }
    },
    onLogin() {
      (this.$refs.login_form as any).validate((valid: boolean) => {
        if (valid) {
          this.userStore.logIn(
            this.login_form.user_name_or_email,
            this.login_form.user_passwd,
            (response: UserLoginResponse) => {
              this.login_form.user_passwd = "";
              this.isShowLoginTab = false;
            }
          );
        }
      });
    },
    onRegister() {
      (this.$refs.register_form as any).validate((valid: boolean) => {
        if (valid) {
          registerUser(this.register_form.user_name, this.register_form.user_email, this.register_form.user_passwd, (response: UserRegisterResponse) => {
            this.onCloseLoginPanel();
          });
        }
      });
    },
    onLogout() {
      this.userStore.logOut();
    },
    onOpenLoginPanel() {
      this.isLoginPanel = true;
      this.isShowLoginTab = true;
      this.updateUserInfoToLoginPageFromVisitor();
    },
    onCloseLoginPanel() {
      this.isShowLoginTab = false;
      // this.updateUserInfoToVisitorFromLoginPage();
    },
    updateUserInfoToLoginPageFromVisitor() {
      if (this.comment_form.user_email) {
        this.login_form.user_name_or_email = this.comment_form.user_email;
        return;
      }
      if (this.comment_form.user_name) {
        this.login_form.user_name_or_email = this.comment_form.user_name;
        return;
      }
    },
    updateUserInfoToVisitorFromLoginPage() {
      if (this.login_form.user_name_or_email) {
        if (isEmail(this.login_form.user_name_or_email)) {
          this.comment_form.user_email = this.login_form.user_name_or_email;
        }
        else {
          this.comment_form.user_name = this.login_form.user_name_or_email;
        }
      }
    },
    submitSuccessCb(comment: CommentItemInfo): void {
      this.comment_content = "";
    },
    submitErrorCb(error?: ErrorInfo): void {
      if (error && error.error_code == ServerErrorCode.EC_VISITOR_LOGIN_NEED_PASSWD_AUTHENTICATION) {
        setTimeout(() => {
          this.onOpenLoginPanel();
        }, 500);
      }
    },
    checkEmailAllowEmpty(rule: any, value: any, callback: any): void {
      if (value && !isEmail(value)) {
        return callback(new Error("邮箱格式错误"));
      }
      else {
        callback();
      }
    },
    checkConfirmPasswd(rule: any, value: any, callback: any): void {
      if (value != this.register_form.user_passwd) {
        return callback(new Error("两次输入的密码不一致"));
      }
      else {
        callback();
      }
    },
    checkUserNameXSS(rule: any, value: any, callback: any): void {
      if (checkXSSAttack(value)) {
        return callback(new Error("用户名包含XSS攻击"));
      }
      else {
        callback();
      }
    },
    onFocusInputBox() {
      if (this.is_primary_submit_box) {
        this.reply_mutex_ctrl_mask = true;
        this.replyMutex.acquire(this.reply_scope);
      }
      this.isShowUserInteractive = true;
    }
  },
  mounted() {
    if (this.is_primary_submit_box) {
      this.replyMutex.$subscribe(
        (mutation, state) => {
          if (!this.reply_mutex_ctrl_mask
            && state.scope == this.reply_scope) {
            this.isShowUserInteractive = false;
          }
          this.reply_mutex_ctrl_mask = false;
        }
      )
    }
  },
  components: { MarkdownView }
});
</script>

<template>
  <!-- Comment Box -->
  <div class="comment_box_container">
    <el-input v-model="comment_content" :autosize="{ minRows: 5 }" type="textarea" placeholder="Please input"
      resize="none" ref="comment_input" v-show="!isShowPreview" @focus="onFocusInputBox" />
    <div class="comment_preview" :style="preview_height" v-show="isShowPreview" @click="onFocusInputBox">
      <MarkdownView :rendered_markdown="md_preview" />
    </div>
    <el-button class="preview_button" type="primary" @click="onPreview()" v-show="isShowUserInteractive" size="small"
      round plain>{{ preview_button_content }}</el-button>
  </div>

  <div class="user_submit_control_container" v-show="isShowUserInteractive">
    <el-form :rules="visitor_rules" :model="comment_form" ref="comment_form" v-show="!userStore.is_valid">
      <div class="visitor_form">
        <!-- Visitor Submission Control -->
        <div class="visitor_name_box">
          <el-form-item class="visitor_submission_component" id="visitor_name_input_box" label="游客名 :" prop="user_name">
            <!-- <span>用户名：</span> -->
            <el-input v-model="comment_form.user_name" :maxlength="user_name_max_len" show-word-limit />
          </el-form-item>

        </div>

        <div class="visitor_email_box">
          <el-form-item class="visitor_submission_component" id="visitor_email_input_box" label="邮箱 :"
            prop="user_email">
            <!-- <span>邮箱：</span> -->
            <el-tooltip class="box-item" effect="dark" content="系统会记录你填写的邮箱，以作为你下次使用该游客名称的凭据（即，下次使用该游客名时，必须填写该邮箱）"
              placement="bottom">
              <el-input v-model="comment_form.user_email" placeholder="Optional" :maxlength="user_email_max_len"
                show-word-limit />
            </el-tooltip>
          </el-form-item>
        </div>

        <div class="visitor_submit_box">
          <el-dropdown split-button type="primary" @click="onVisitorSubmit()">
            提交（免注册）
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click=onOpenLoginPanel>登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- <button type="button" @click="onPreview()">{{ preview_button_content }}</button> -->
    </el-form>

    <el-form v-show="userStore.is_valid">
      <div class="user_form">
        <div class="user_info_box" v-show="is_show_logined_user">
          <span>用户{{ userStore.user_name }}已登录</span>
        </div>

        <div class="user_submit_box">
          <el-dropdown split-button type="primary" @click="onUserSubmit()">
            提交
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="onLogout()">登出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-form>
  </div>

  <!-- Login Or Register Dialog -->
  <el-dialog v-model="isShowLoginTab" :title="login_register_title" width="400px" :before-close="onCloseLoginPanel">
    <el-form label-width="120px" label-position="right" :rules="login_rules" :model="login_form" ref="login_form"
      v-show="isLoginPanel" class="login-register-form">
      <el-form-item label="用户名或邮箱" prop="user_name_or_email">
        <el-input class="user_input" v-model="login_form.user_name_or_email" />
      </el-form-item>

      <el-form-item label="密码" prop="user_passwd">
        <el-input class="user_input" v-model="login_form.user_passwd" type="password" show-password />
      </el-form-item>
    </el-form>

    <el-form label-width="120px" label-position="right" :rules="register_rules" :model="register_form"
      ref="register_form" v-show="!isLoginPanel" class="login-register-form">
      <el-form-item label="用户名" prop="user_name">
        <el-input class="user_input" v-model="register_form.user_name" :maxlength="user_name_max_len" show-word-limit />
      </el-form-item>

      <el-form-item label="邮箱" prop="user_email">
        <el-input class="user_input" v-model="register_form.user_email" :maxlength="user_email_max_len"
          show-word-limit />
      </el-form-item>

      <el-form-item label="密码" prop="user_passwd">
        <el-input class="user_input" v-model="register_form.user_passwd" :maxlength="user_passwd_max_len"
          type="password" show-password />
      </el-form-item>

      <el-form-item label="确认密码" prop="user_passwd_confirm">
        <el-input class="user_input" v-model="register_form.user_passwd_confirm" :maxlength="user_passwd_max_len"
          type="password" show-password />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer-login" v-show="isLoginPanel">
        <el-button @click="isLoginPanel = false" type="primary">
          没有帐号？
        </el-button>
        <span class="dialog-footer-button-group">
          <el-button @click=onCloseLoginPanel>取消</el-button>
          <el-button @click=onLogin type="primary">
            登录
          </el-button>
        </span>
      </span>
      <span class="dialog-footer-register" v-show="!isLoginPanel">
        <span class="dialog-footer-button-group">
          <el-button @click=onCloseLoginPanel>取消</el-button>
          <el-button @click=onRegister type="primary">
            注册
          </el-button>
        </span>
      </span>
    </template>
  </el-dialog>

</template>

<style scoped>
.comment_box_container {
  margin-bottom: 10px;
  position: relative;
}

.comment_preview {
  /* width: 100%; */
  /* min-height: 10rem; */
  /* background-color: white; */
  border: 1px solid rgb(167, 167, 167);
  border-radius: 5px;
  padding: 10px;
}

.preview_button {
  position: absolute;
  z-index: 2;
  bottom: 5px;
  right: 5px;
}

.dialog-footer-login {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.login-register-form {
  margin-right: 30px;
}

@media screen and (min-width: 874px) {
  .visitor_form {
    display: flex;
  }

  .visitor_submit_box {
    margin-left: auto;
  }

  .visitor_name_box {
    flex: 0 1 320px;
    margin-right: 30px;
  }

  .visitor_email_box {
    flex: 0 1 320px;
    margin-right: 30px;
  }
}

@media screen and (max-width: 874px) {

  /* TODO: need to evaluate whether its good to manipulate the element-ui internal */
  ::v-deep .el-form-item__label {
    width: 80px;
  }

  .visitor_submit_box {
    display: flex;
    justify-content: right;
  }
}

/* TODO: need to evaluate whether its good to manipulate the element-ui internal */
::v-deep .el-button-group {
  display: inline-flex;
}

.user_form {
  display: flex;
  align-items: center;
}

.user_submit_box {
  margin-left: auto;
}
</style>