import { CommentItemInfoList } from "./types";

export function sortCommentList(comment_list : CommentItemInfoList) : void {
  comment_list.sort((lhs, rhs) => {
    let lhs_timestamp = parseFloat(lhs.comment_time);
    let rhs_timestamp = parseFloat(rhs.comment_time);

    if (lhs_timestamp < rhs_timestamp) {
      return 1;
    } else if (lhs_timestamp > rhs_timestamp) {
      return -1;
    } else {
      return 0;
    }
  })
}

export function getLocalTimeFromTimestamp(timestamp : string) : string {
  let parts = timestamp.split(".");
  let timestamp_final = 0;
  if (parts.length == 1) {
    timestamp_final = parseInt(parts[0]) * 1000;
  } else if (parts.length == 2) {
    timestamp_final = parseInt(parts[0]) * 1000 + parseInt(parts[1].substring(0, 3));
  } else {
    return "Time parse failed"
  }
  
  let date = new Date(timestamp_final);
  return date.toLocaleString();
}