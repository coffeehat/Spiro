class Appearance {
  static is_hide_user_ctrl_box_at_first = true;
  static comment_box_border_color = "rgb(190, 190, 190)"
}

class CommentLoad {
  static number_of_primary_comments_at_start = 10;
  static number_of_sub_comments_per_primary_at_start = 3;
  static number_of_new_load_primary_comment = 8;
  static number_of_new_load_sub_comments = 5;
}

class ReadCountInfo {
  static update_delay_ms = 20000;
  static article_link = "";
  static article_name = "";
}

export class SpiroConfig {
  static server_addr = "http://127.0.0.1:5000";
  static article_uuid = "0";
  static appearance = Appearance;
  static commentload = CommentLoad;
  static readcountinfo = ReadCountInfo
}
