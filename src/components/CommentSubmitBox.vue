<script lang="ts">
  import { defineComponent } from 'vue';

  import eventBus from '../common/eventBus'

  import { marked } from '../common/markdown'
  import { UserCookies } from '../common/cookies'
  import { submitCommentForVisitor, submitCommentForUser, loginUser } from '../common/network';
  import { CommentItemInfo, UserLoginResponse, ErrorInfo } from '../common/types';
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

        // User related
        user_name: "",
        user_email: "",
        user_passwd: "",

        user_name_or_email: "",

        // Comment related
        comment_content: "",

        // User/Visitor Switch
        isVisitorPanel: true,
        logined_user_name: ""
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
        submitCommentForVisitor(
          this.article_id, 
          this.user_name, 
          this.user_email, 
          this.comment_content, 
          submitSuccessCb
        );
      },
      onUserSubmit() {
        submitCommentForUser(
          this.article_id,
          this.comment_content,
          submitSuccessCb
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
        loginUser(
          this.user_name_or_email,
          this.user_passwd,
          // success callback
          (response: UserLoginResponse) => {
            this.isShowLoginTab = false;
            this.switch2UserPanel(response.user_name);
          },
          // error callback
          (response?: ErrorInfo) => {
            // do nothing
          }
        );
      },
      onOpenLoginPanel() {
        this.isShowLoginTab = true;
        this.updateUserInfoToLoginPageFromVisitor();
      },
      onCloseLoginPanel() {
        this.isShowLoginTab = false;
        this.updateUserInfoToVisitorFromLoginPage();
      },
      updateUserInfoToLoginPageFromVisitor() {
        if (this.user_email) {
          this.user_name_or_email = this.user_email;
          return;
        }
        if (this.user_name) {
          this.user_name_or_email = this.user_name;
          return;
        }
      },
      updateUserInfoToVisitorFromLoginPage() {
        if (this.user_name_or_email) {
          if (isEmail(this.user_name_or_email)) {
            this.user_email = this.user_name_or_email;
          } else {
            this.user_name = this.user_name_or_email;
          }
        }
      },
      switch2UserPanel(user_name : string) {
        this.isVisitorPanel = false;
        this.logined_user_name = user_name;
      },
      switch2VisitorPanel() {
        this.isVisitorPanel = true;
      }
    },
    beforeMount() {
      let user_cookies = UserCookies.retrieve_from_cookies();
      if (user_cookies) {
        this.switch2UserPanel(user_cookies.get_user_name());
        // TODO: actively connect to server to check the token
      }
    }
  });

  function submitSuccessCb(comment: CommentItemInfo) : void {
    eventBus.emit("addNewComment", comment);
  }
</script>

<template>
  <form>
    <!-- Comment Box -->
    <div class="comment_box_container">
      <textarea class="comment_textarea" v-model="comment_content" v-show="!isShowPreview"></textarea>
      <div class="comment_preview" v-html="md_preview" v-show="isShowPreview"></div>
    </div>
    
    <!-- Visitor Submission Control -->
    <div class="visitor_submit_interactive_container" v-show="isVisitorPanel">
      <div class="visitor_info_box">
        <div class="visitor_submission_component" id="visitor_name_input_box">
          <span>用户名：</span>
          <el-input
            class="visitor_input"
            v-model="user_name"
          />
        </div>

        <div class="visitor_submission_component" id="visitor_email_input_box">
          <span>邮箱：</span>
          <el-tooltip
            class="box-item"
            effect="dark"
            content="如果这次评论填写了邮箱，那么下次使用该用户名时必须填写此邮箱"
            placement="top"
          >
            <el-input
              class="visitor_input"
              v-model="user_email"
              placeholder="Optional"
              />
          </el-tooltip>
        </div>
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
              <el-dropdown-item>登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <!-- <button type="button" @click="onPreview()">{{ preview_button_content }}</button> -->
    <!-- <button type="button">want to Register?</button> -->
    <!-- <button type="button">Login or Register</button> -->
  </form>

  <!-- Login Or Register Dialog -->
  <el-dialog 
    v-model="isShowLoginTab" 
    title="登录" 
    width="400px" 
    :before-close="onCloseLoginPanel"
  >
    <el-form label-width="120px" label-position="right">
      <el-form-item label="用户名或邮箱">
        <el-input
          class="user_input"
          v-model="user_name_or_email"
        />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          class="user_input"
          v-model="user_passwd"
          type="password"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary">
          没有帐号？
        </el-button>
        <span class="dialog-footer-button-group">
          <el-button @click=onCloseLoginPanel>取消</el-button>
          <el-button @click=onLogin type="primary">
            登录
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
    align-items: center;
  }

  .visitor_submission_component,
  .user_submission_component {
    margin-right: 20px;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    line-height: 100%;
  }

  .dialog-footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>