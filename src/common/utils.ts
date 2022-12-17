import { CommentItemInfoList } from "./types";
import { ElMessage } from 'element-plus';

import moment from 'moment';

export function sortCommentList(comment_list: CommentItemInfoList): void {
  comment_list.sort((lhs, rhs) => {
    let lhs_timestamp = parseFloat(lhs.comment_timestamp);
    let rhs_timestamp = parseFloat(rhs.comment_timestamp);

    if (lhs_timestamp < rhs_timestamp) {
      return 1;
    } else if (lhs_timestamp > rhs_timestamp) {
      return -1;
    } else {
      return 0;
    }
  })
}

export function convertTimestampString2Number(timestamp: string): number {
  let parts = timestamp.split(".");
  let timestamp_final = 0;
  if (parts.length == 1) {
    timestamp_final = parseInt(parts[0]) * 1000;
  } else if (parts.length == 2) {
    timestamp_final = parseInt(parts[0]) * 1000 + parseInt(parts[1].substring(0, 3));
  } else {
    timestamp_final = 0;
  }
  return timestamp_final;
}

export function convertTimestamp2JsDate(timestamp: string): Date {
  let timestamp_s = convertTimestampString2Number(timestamp);
  let date = new Date(timestamp_s);
  return date;
}

export function convertTimestamp2CookieExpireTime(timestamp: string): string {
  let date = convertTimestamp2JsDate(timestamp);
  let formatter = moment(date);
  formatter.locale('en');
  let ret = formatter.format('ddd, DD MMM YYYY HH:MM:SS ') + 'GMT';
  return ret;
}

export function getLocalTimeFromTimestamp(timestamp: string): string {
  let date = convertTimestamp2JsDate(timestamp);

  if (date instanceof Date) {
    return date.toLocaleString();
  } else {
    return date;
  }
}

export function getLocalFormattedTimeFromTimestamp(timestamp: string): string {
  let date = convertTimestamp2JsDate(timestamp);
  // return moment(date).format("MMM-DD-YYYY, HH:mm");
  return moment(date).format("MMM DD, YYYY HH:mm");
}

export function isEmail(email: string): boolean {
  let pattern = /([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+/;
  return Boolean(email.match(pattern));
}

export function showErrorMessage(error_message: string) {
  ElMessage.error({
    message: error_message
  });
}

export function showSuccessMessage(message: string) {
  ElMessage.success({
    message: message
  });
}

export function showInfoMessage(message: string) {
  ElMessage.info({
    message: message
  });
}