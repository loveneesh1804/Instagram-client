import {
  IAttachments,
  IMessageSocketType,
  IUserProfile,
  PreviewFile,
} from "./types";

export const formatCaption = (el: string): string => {
  return el
    .slice(0, 80)
    .split(" ")
    .filter((el, i, arr) => el !== arr[arr.length - 1])
    .join(" ");
};

export const Null = "null";
export const PENDING = "pending";
export const SKELETON = "skeleton";

export const fileFormat = (url: string = ""): IAttachments => {
  const fileExt = url.split(".").pop();

  if (
    fileExt === "mp4" ||
    fileExt === "webm" ||
    fileExt === "ogg" ||
    fileExt === "mov"
  )
    return "video";

  if (fileExt === "mp3" || fileExt === "wav") return "audio";
  if (
    fileExt === "png" ||
    fileExt === "jpg" ||
    fileExt === "jpeg" ||
    fileExt === "gif"
  )
    return "image";

  return "file";
};

export const dateAgo = (date: string) => {
  let date1 = new Date(date);
  let date2 = new Date();

  let Difference_In_Time = date2.getTime() - date1.getTime();

  let Difference_In_Seconds = Math.trunc(Difference_In_Time / (1000 * 1));

  let Difference_In_Minutes = Math.trunc(Difference_In_Time / (1000 * 60));

  let Difference_In_Hours = Math.trunc(Difference_In_Time / (1000 * 3600 * 1));

  let Difference_In_Days = Math.trunc(Difference_In_Time / (1000 * 3600 * 24));

  let Difference_In_Weeks = Math.trunc(
    Difference_In_Time / (1000 * 3600 * 24 * 7)
  );

  if (Difference_In_Weeks > 0) {
    return Difference_In_Weeks + "w";
  }
  if (Difference_In_Days > 0) {
    return Difference_In_Days + "d";
  }
  if (Difference_In_Hours > 0) {
    return Difference_In_Hours + "h";
  }
  if (Difference_In_Minutes > 0) {
    return Difference_In_Minutes + "m";
  }
  if (Difference_In_Seconds > 0) {
    return Difference_In_Seconds + "s";
  }
};

export const dateFormat = (date: string) => {
  const date1 = new Date(date);
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long"
  });
  const formatDate = dateTimeFormatter.format(date1);
  return formatDate;
};

export const timeFormat = (date: string) => {
  const date1 = new Date(date);
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
  const formatDate = dateTimeFormatter.format(date1);
  return formatDate;
};

export const newLineStrFormat = (str: string) => {
  if (str.includes("\n")) {
    const formatStr = str
      .split("\n")
      .join(process.env.REACT_APP_SEPRATOR as string);
    return formatStr;
  }
  return str;
};

export const toOriginalStr = (str: string) => {
  if (str.includes(process.env.REACT_APP_SEPRATOR as string)) {
    const originalStr = str.split(process.env.REACT_APP_SEPRATOR as string);
    return originalStr;
  }
  return [str];
};

export const transformImage = (url: string = "", width: number = 800) => {
  const newUrl = url.replace("upload/", `upload/w_${width},dpr_auto/`);

  return newUrl;
};

export const generateFakerMsg = (
  arr: PreviewFile[] = [],
  sender: string = "",
  id: string
) => {
  const data: IMessageSocketType = {
    content: "",
    chatId: "skeleton",
    attachments: arr.map(({ name, url, type }) => ({
      public_id: name + "." + type,
      url,
    })),
    _id: id,
    sender: {
      _id: sender,
      name: PENDING,
    },
    createdAt: new Date().toISOString(),
  };

  return data;
};

export const checkIsFriend = (user: IUserProfile, id: string) => {
  return user.followings.includes(id);
};

export const formatGroupMemberName = (
  el: { _id: string; name: string }[]
): string => {
  return (
    el
      .slice(0, 2)
      .reduce(
        (acc, elm, i) =>
          (acc += `${elm.name}${i !== el.slice(0, 2).length - 1 ? ", " : ""}`),
        ""
      ) + (el.length > 2 ? "..." : "")
  );
};
