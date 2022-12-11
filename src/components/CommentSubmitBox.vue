<script lang="ts">
  import { defineComponent, registerRuntimeCompiler } from 'vue';

  import eventBus from '../common/eventBus'
  
  import { marked } from '../common/markdown'
  import { UserCookies } from '../common/cookies'
  import { 
    submitCommentForVisitor, 
    submitCommentForUser, 
    loginUser, 
    checkToken, 
    registerUser
  } from '../common/network';
  import { 
    CommentItemInfo, 
    UserLoginResponse, 
    ErrorInfo, 
    TokenCheckResponse,
    UserRegisterResponse
  } from '../common/types';
  import { ServerErrorCode } from '../common/errors';
  import { isEmail } from '../common/utils'

  export default defineComponent ({
    name: "Comment Submit Box",
    data() {
      return {
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

        // User/Visitor Switch
        isVisitorPanel: true,
        logined_user_name: "",

        // Form rules for Visitor
        visitor_rules: {
          user_name: [
            { required: true, message: "请输入名称", trigger: "blur"},
            { min: 1, max: this.user_name_max_len, message: `名字长度不能超过${this.user_name_max_len}`, trigger: 'blur'}
          ],
          user_email: [
            { validator: this.checkEmailAllowEmpty, trigger: 'blur' }
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
            { required: true, message: "请输入名称或邮箱", trigger: "blur"},
            // TODO: Give a validator here to validate the length of name or email
          ],
          user_passwd: [
            { required: true, message: "请输入密码", trigger: "blur"},
            { min: 1, max: this.user_email_passwd_len, message: `密码长度不能超过${this.user_passwd_max_len}`, trigger: 'blur'}
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
            { required: true, message: "请输入名称", trigger: "blur"},
            { min: 1, max: this.user_name_max_len, message: `名字长度不能超过${this.user_name_max_len}`, trigger: 'blur'}
          ],
          user_email: [
            { required: true, message: "请输入邮箱", trigger: "blur"},
            { min: 1, max: this.user_email_max_len, message: `邮箱长度不能超过${this.user_email_max_len}`, trigger: 'blur'},
            { validator: this.checkEmailAllowEmpty, trigger: 'blur' }
          ],
          user_passwd: [
            { required: true, message: "请输入密码", trigger: "blur"},
            { min: 1, max: this.user_email_passwd_len, message: `密码长度不能超过${this.user_passwd_max_len}`, trigger: 'blur'}
          ],
          user_passwd_confirm: [
            { required: true, message: "请输入确认密码", trigger: "blur"},
            { validator: this.checkConfirmPasswd, trigger: 'blur' }
          ]
        }
      }
    },
    computed: {
      login_register_title() {
        if (this.isLoginPanel) {
          return "登录";
        } else {
          return "注册"
        }
      }
    },
    props:
    {
      article_id:
      {
        type: Number,
        default: 0
      }
    },
    methods: {
      onVisitorSubmit() {
        (this.$refs.comment_form as any).validate(
          (valid : boolean) => {
            if (valid) {
              submitCommentForVisitor(
                this.article_id, 
                this.comment_form.user_name, 
                this.comment_form.user_email, 
                this.comment_content, 
                this.submitSuccessCb,
                this.submitErrorCb
              );
            }
          } 
        );
      },
      onUserSubmit() {
        submitCommentForUser(
          this.article_id,
          this.comment_content,
          this.submitSuccessCb
        );
      },
      onPreview() {
        if (this.isShowPreview) {
          this.isShowPreview = !this.isShowPreview;
          this.md_preview = "";
          this.preview_button_content = "to Preview"
        } else {
          this.md_preview = marked.parse(this.comment_content);
          this.isShowPreview = !this.isShowPreview;
          this.preview_button_content = "back to Editor"
        }
      },
      onLogin() {
        (this.$refs.login_form as any).validate(
          (valid : boolean) => {
            if (valid) {
              loginUser(
                this.login_form.user_name_or_email,
                this.login_form.user_passwd,
                // success callback
                (response: UserLoginResponse) => {
                  this.login_form.user_passwd = "";
                  this.isShowLoginTab = false;
                  this.switch2UserPanel(response.user_name);
                },
                // error callback
                (response?: ErrorInfo) => {
                  // do nothing
                }
              );
            }
          } 
        );
      },
      onRegister() {
        (this.$refs.register_form as any).validate(
          (valid : boolean) => {
            if (valid) {
              registerUser(
                this.register_form.user_name,
                this.register_form.user_email,
                this.register_form.user_passwd,
                (response: UserRegisterResponse) => {
                  this.onCloseLoginPanel();
                }
              );
            }
          } 
        );
      },
      onLogout() {
        UserCookies.delete_cookies();
        this.switch2VisitorPanel();
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
          } else {
            this.comment_form.user_name = this.login_form.user_name_or_email;
          }
        }
      },
      switch2UserPanel(user_name : string) {
        this.isVisitorPanel = false;
        this.logined_user_name = user_name;
      },
      switch2VisitorPanel() {
        this.isVisitorPanel = true;
      },
      submitSuccessCb(comment: CommentItemInfo) : void {
        this.comment_content = "";
        eventBus.emit("addNewComment", comment);
      },
      submitErrorCb(error? : ErrorInfo) : void {
        if (error && error.error_code == ServerErrorCode.EC_VISITOR_LOGIN_NEED_PASSWD_AUTHENTICATION) {
          setTimeout(() => {
            this.onOpenLoginPanel();
          }, 500);
        }
      },
      checkEmailAllowEmpty(rule : any, value : any, callback : any) : void {
        if (value && !isEmail(value)) {
          return callback(new Error('邮箱格式错误'));
        } else {
          callback();
        }
      },
      checkConfirmPasswd(rule : any, value : any, callback : any) : void {
        if (value != this.register_form.user_passwd) {
          return callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      }
    },
    beforeMount() {
      let user_cookies = UserCookies.retrieve_from_cookies();
      if (user_cookies) {
        checkToken(
          user_cookies.get_token(),
          (response: TokenCheckResponse) => {
            this.switch2UserPanel((user_cookies as UserCookies).get_user_name());
          }
        );
      }
    }
  });
</script>

<template>
  <el-form
    :rules="visitor_rules"
    :model="comment_form"
    ref="comment_form"
  >
    <!-- Comment Box -->
    <div class="comment_box_container">
      <textarea class="comment_textarea" v-model="comment_content" v-show="!isShowPreview"></textarea>
      <div class="comment_preview" v-html="md_preview" v-show="isShowPreview"></div>
    </div>
    
    <!-- Visitor Submission Control -->
    <div class="visitor_submit_interactive_container" v-show="isVisitorPanel">
      <div class="visitor_info_box">
        <el-form-item
          class="visitor_submission_component"
          id="visitor_name_input_box"
          label="游客名 :"
          prop="user_name"
        >
          <!-- <span>用户名：</span> -->
          <el-input
            class="visitor_input"
            v-model="comment_form.user_name"
            :maxlength="user_name_max_len"
            show-word-limit
          />
        </el-form-item>

        <el-form-item
          class="visitor_submission_component"
          id="visitor_email_input_box"
          label="邮箱 :"
          prop="user_email"
        >
          <!-- <span>邮箱：</span> -->
          <el-tooltip
            class="box-item"
            effect="dark"
            content="系统会记录你填写的邮箱，以作为你下次使用该游客名称的凭据（即，下次使用该游客名时，必须填写该邮箱）"
            placement="top"
          >
            <el-input
              class="visitor_input"
              v-model="comment_form.user_email"
              placeholder="Optional"
              :maxlength="user_email_max_len"
              show-word-limit
              />
          </el-tooltip>
        </el-form-item>
      </div>

      <div class="flex flex-wrap items-center submit_buttons">
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

    <div class="user_submit_interactive_container" v-show="!isVisitorPanel">
      <div class="user_submission_component">
        <span>用户{{ logined_user_name }}已登录</span>
      </div>

      <div class="flex flex-wrap items-center submit_buttons">
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

    <!-- <button type="button" @click="onPreview()">{{ preview_button_content }}</button> -->
  </el-form>

  <!-- Login Or Register Dialog -->
  <el-dialog 
    v-model="isShowLoginTab" 
    :title="login_register_title"
    width="400px" 
    :before-close="onCloseLoginPanel"
  >
    <el-form
      label-width="120px"
      label-position="right"
      :rules="login_rules"
      :model="login_form"
      ref="login_form"
      v-show="isLoginPanel"
      class="login-register-form"
    >
      <el-form-item
        label="用户名或邮箱"
        prop="user_name_or_email"
      >
        <el-input
          class="user_input"
          v-model="login_form.user_name_or_email"
        />
      </el-form-item>

      <el-form-item
        label="密码"
        prop="user_passwd"
      >
        <el-input
          class="user_input"
          v-model="login_form.user_passwd"
          type="password"
          show-password
        />
      </el-form-item>
    </el-form>

    <el-form
      label-width="120px"
      label-position="right"
      :rules="register_rules"
      :model="register_form"
      ref="register_form"
      v-show="!isLoginPanel"
      class="login-register-form"
    >
      <el-form-item
        label="用户名"
        prop="user_name"
      >
        <el-input
          class="user_input"
          v-model="register_form.user_name"
          :maxlength="user_name_max_len"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        label="邮箱"
        prop="user_email"
      >
        <el-input
          class="user_input"
          v-model="register_form.user_email"
          :maxlength="user_email_max_len"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        label="密码"
        prop="user_passwd"
      >
        <el-input
          class="user_input"
          v-model="register_form.user_passwd"
          :maxlength="user_passwd_max_len"
          type="password"
          show-password
        />
      </el-form-item>

      <el-form-item
        label="确认密码"
        prop="user_passwd_confirm"
      >
        <el-input
          class="user_input"
          v-model="register_form.user_passwd_confirm"
          :maxlength="user_passwd_max_len"
          type="password"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer-login" v-show="isLoginPanel">
        <el-button @click="isLoginPanel = false" type="primary">
          没有帐号？
        </el-button>
        <span class="dialog-footer-button-group">
          <el-button @click=onCloseLoginPanel>取消</el-button>
          <el-button @click=onLogin type="primary" >
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
  }

  .comment_textarea {
    width: 100%;
    min-height: 10rem;
    border-radius: 5px;
    padding: 10px;
    display: block;
  }
  .comment_preview {
    width: 100%;
    min-height: 10rem;
    /* background-color: white; */
    outline: 1px solid black;
    border-radius: 15px;
    padding:10px;
  }

  .submit_buttons,
  .visitor_info_box,
  .visitor_input,
  .visitor_submission_component,
  .user_submission_component {
    display: inline
  }

  .visitor_submit_interactive_container,
  .user_submit_interactive_container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    /* align-items: center; */
  }

  .visitor_submission_component,
  .user_submission_component {
    margin-right: 20px;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    line-height: 100%;
    /* Cancel margin bottom introduced by el-form-item */
    margin-bottom: 0px;
  }

  .dialog-footer-login {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .login-register-form {
    margin-right: 30px;
  }
</style>