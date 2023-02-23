import { CommentItemInfoList } from "./types";
import { ElMessage } from 'element-plus';
import { Md5 } from 'ts-md5';
import { DateTime } from 'ts-luxon';
import { filterXSS } from 'xss';

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
  let temp = DateTime.fromJSDate(date);
  let year = temp.year;
  let month = temp.monthShort;
  let day = temp.day.toString().padStart(2, "0");
  let hour = temp.hour.toString().padStart(2, "0");
  let minute = temp.minute.toString().padStart(2, "0");
  return `${month} ${day}, ${year} ${hour}:${minute}`
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

export function getCommentAnchor() {
  let anchor = window.location.hash.substring(1)
  if (anchor.match(/spirorips_([ps])_([0-9]+)/)) {
    return anchor;
  } else {
    return "";
  }
}

export function goToAnchorIfValid() {
  let anchor = getCommentAnchor()
  if (anchor) {
    const createTimer = () => {
      return setTimeout(() => {
        let elem = document.getElementById(anchor)
        if (elem) {
          elem.scrollIntoView();
        }
      }, 300);
    }

    let timer = createTimer()
    let observer = new ResizeObserver((entries) => {
      clearTimeout(timer);
      timer = createTimer();
    })
    observer.observe(document.body);
  }
}

// Config Set for Avatar
const bgColors = [
  '#9287ff',
  '#6bd9e9',
  '#fc909f',
  '#f4d150',
  '#e0ddff',
  '#d2eff3',
  '#ffedef',
  '#ffeba4',
  '#506af4',
  '#f48150',
  '#74d153',
];
const hatColors = [
  '#000',
  '#fff',
  '#77311d',
  '#fc909f',
  '#d2eff3',
  '#506af4',
  '#f48150',
];
const faceColors = ['#f9c9b6', '#ac6651'];
const hairColors = [
  '#000',
  '#fff',
  '#77311d',
  '#fc909f',
  '#d2eff3',
  '#506af4',
  '#f48150',
];
const shirtColors = ['#9287ff', '#6bd9e9', '#fc909f', '#f4d150', '#77311d'];

const sexes = ["male", "female"];
const earSizes = ["small", "big"];
const eyeTypes = ["circle", "oval", "smile"];
const hatTypes = ["none", "beanie", "turban"];
const hairTypes = ["normal", "thick", "mohawk", "femaleLong", "femaleShort"];
const noseTypes = ["short", "long", "round"];
const mouthTypes = ["laugh", "smile", "peace"];
const shirtTypes = ["hoody", "short", "polo"];
const glassesTypes = ["none", "round", "square"];

export function genAvatarConfigByUserId(id: number) {
  let hash = Md5.hashStr(id.toString(), true);
  for (let i = 0; i != hash.length; ++i) {
    hash[i] = Math.abs(hash[i]);
  }
  return {
    bgColor: bgColors[Math.floor(hash[0] / 1) % bgColors.length],
    hatColor: hatColors[Math.floor(hash[0] / 10) % hatColors.length],
    faceColor: faceColors[Math.floor(hash[0] / 100) % faceColors.length],
    hairColor: hairColors[Math.floor(hash[0] / 1000) % hairColors.length],
    shirtColor: shirtColors[Math.floor(hash[1] / 1) % shirtColors.length],
    sex: sexes[Math.floor(hash[1] / 10) % sexes.length],
    earSize: earSizes[Math.floor(hash[1] / 100) % earSizes.length],
    eyeType: eyeTypes[Math.floor(hash[1] / 1000) % eyeTypes.length],
    hatType: hatTypes[Math.floor(hash[2] / 1) % hatTypes.length],
    hairType: hairTypes[Math.floor(hash[2] / 10) % hairTypes.length],
    noseType: noseTypes[Math.floor(hash[2] / 100) % noseTypes.length],
    mouthType: mouthTypes[Math.floor(hash[2] / 1000) % mouthTypes.length],
    shirtType: shirtTypes[Math.floor(hash[3] / 1) % shirtTypes.length],
    glassesType: glassesTypes[Math.floor(hash[3] / 10) % glassesTypes.length]
  };
}

export function checkXSSAttack(html: string) {
  let temp = filterXSS(html);
  return temp != html;
}

export function filterXSSAttack(html: string) {
  return filterXSS(html);
}