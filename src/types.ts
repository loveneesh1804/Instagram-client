import { ReactElement } from "react";
import { Location } from "react-router-dom";

export interface LiProps {
  url: string;
  text: string;
  Icon?: ReactElement;
  location: Location;
  active?: ReactElement;
  profile?: string;
}
export type SvgInHtml = HTMLElement & SVGElement;

export type SideBarType = {
  search: boolean;
  notify: boolean;
  post: boolean;
  more: boolean;
  chats: boolean;
};

export interface ILogin {
  username: string;
  password: string;
}

export interface ISignUp extends ILogin {
  name: string;
}
export interface ResponseCommonType {
  message: string;
  success: boolean;
}

export interface NewChatResponse extends ResponseCommonType{
  chatId: string;
  chat: IMyChats;
}

export interface IUpadtedUserResponse extends ResponseCommonType {
  data: IUserProfile;
}
export interface IUserProfile {
  _id: string;
  name: string;
  username: string;
  bio: string;
  avatar: AttachmentsType;
  followers: string[];
  followings: string[];
  createdAt: string;
}
export interface IProfile {
  success: boolean;
  user: IUserProfile;
}

export type UserStateType = {
  user: IUserProfile;
  verified: boolean;
};

export type ProtectedProps = {
  verified: boolean;
};

export interface IValidationFunction {
  [key: string]: (value: string) => { res: boolean; msg: string };
}

export type UseFormValidationProps = {
  validations: IValidationFunction;
  onSubmit: Function;
};

export type FormType = {
  [key: string]: string;
};

export type ErrorsType = {
  [key: string]: {
    msg: string;
    res: boolean;
  };
};
export type ValidatorReturn = {
  msg: string;
  res: boolean;
};

export interface IMyChatsResponse {
  success: boolean;
  chats: IMyChats[];
}

export interface IMessageResponse {
  success: boolean;
  data: IMessageSocketType[];
  pages: number;
}

export interface IMyChats {
  _id: string;
  groupChats: boolean;
  groupName: string;
  groupMembers: {
    _id: string;
    name: string;
    avatar: AttachmentsType;
    username: string;
  }[];
  lastMessage: IMessageSocketType;
  avatar: string[];
}

export interface PopulatedUserDetails {
  _id: string;
  name: string;
  avatar: string;
}

export interface IMessageType {
  createdAt: string;
  sender: string;
  chatId: string;
  content: String;
  attachments: [AttachmentsType];
}

export interface ISearchUsers {
  success: boolean;
  data: ISearchUsersResponse[];
}

export interface IFollowers{
  success : boolean;
  data: {
    followers: LikesType[]
  }
}

export interface IFollowings{
  success : boolean;
  data: {
    followings: LikesType[]
  }
}

export interface ISearchUsersResponse {
  _id: string;
  avatar: AttachmentsType;
  name: string;
  username: string;
}

export interface SkeletonTypes {
  width: string;
  height: string;
  variant: "Rounded" | "Regular" | "Circular";
}

export type PreviewFile = {
  name: string;
  url: string;
  type: string;
};

export type MyPostResponse = {
  success: boolean;
  data: IPostType[];
  pages: boolean;
};

export type MorePostResponse = {
  success: boolean;
  data: IPostType[];
  username: string;
};

export type IPostMinType = {
  _id: string;
  resources: string;
  likes: number;
  comments: number;
  view: "cover" | "contain";
};

export type ExplorePostResponse = {
  success: boolean;
  data: IPostMinType[];
  totalPages: number;
};

export type CommentsType = {
  user: {
    avatar: AttachmentsType;
    name: string;
    _id: string;
  };
  comment: string;
  _id: string;
  createdAt: string;
};

export type LikesType = {
  avatar: AttachmentsType;
  name: string;
  _id: string;
};

export type IPostType = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar: { url: string };
  };
  resources: AttachmentsType[];
  likes: {
    avatar: AttachmentsType;
    name: string;
    _id: string;
  }[];
  comments: CommentsType[];
  view: "cover" | "contain";
  caption: string;
  createdAt: string;
};

export interface IPostTypeFeed {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar: { url: string };
  };
  resources: AttachmentsType[];
  likes: {
    avatar: AttachmentsType;
    name: string;
    _id: string;
  }[];
  comments: {
    user: string;
    comment: string;
    _id: string;
    createdAt: string;
  }[];
  view: "cover" | "contain";
  caption: string;
  createdAt: string;
}

export interface IGetChatDetails {
  success: boolean;
  chat: ChatType;
}

export type ShowCaption = {
  show: boolean;
  post: string;
};

export type ChatType = {
  createdAt: string;
  groupChat: boolean;
  groupMembers: string[] | PopulatedUserDetails[];
  name: string;
  groupAdmin: string;
  _id: string;
};

export interface IRealTimeMsg {
  chatId: string;
  message: IMessageSocketType;
}

export type IMessageSocketType = {
  content: string;
  chatId: string;
  attachments: AttachmentsType[] | [];
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  createdAt: string;
};

export type AttachmentsType = {
  public_id: string;
  url: string;
};

export type IAttachments = "video" | "image" | "audio" | "file";

export interface IUseInfiniteScroll<T> {
  containerRef: React.RefObject<HTMLDivElement>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPage: number | undefined;
  messages: T[] | undefined;
}

export type MsgNotification = {
  count: number;
  chatId: string;
  message: IMessageSocketType;
};

export type IFriendRequestType = {
  _id: string;
  sender: {
    name: string;
    avatar: AttachmentsType;
    _id: string;
  };
  receiver: string;
  createdAt: string;
  updatedAt: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
};

export type INotification = {
  post: {
    _id: string;
    attachment: string;
  };
  type: "LIKE" | "COMMENT" | "POST";
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar: AttachmentsType;
  };
  receiver: string;
  createdAt: string;
  content: string;
};

export type SocketNotify = {
  post: {
    _id: string;
    attachment: string;
  };
  type: "LIKE" | "COMMENT" | "POST";
  receiver: string;
};

export interface ISuggestionUser {
  name: string;
  username: string;
  avatar: AttachmentsType;
  _id: string;
}

export interface IPropsMaskPost{
  handleShowUser : (type: "Follower" | "Following") => void;
  postNo: number;
  follower: number;
  following: number;
  bio: string;
  name: string;
}