export type CommentItemInfo = {
  article_id: number,
  user_id: number,
  user_name: string,
  comment_id: number,
  comment_timestamp: string,
  comment_content: string
}

export type CommentItemInfoList = CommentItemInfo[];