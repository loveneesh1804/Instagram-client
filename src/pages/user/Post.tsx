import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CaughtUpIco from "../../assets/images/caughtup.png";
import User from "../../assets/images/user.png";
import { MainFooter, SideBarFooter } from "../../components/common/Footer";
import Sidebar from "../../components/main/Sidebar";
import PostMask from "../../mask/PostMask";
import { useGetFriendPostQuery } from "../../redux/api/post.api";
import { IRootState } from "../../redux/store";
import FeedSkeleton from "../../utils/skeletons/FeedSkeleton";
import { Null } from "../../utlis";
import RenderPost from "../../components/common/RenderPost";
import { useGetFriendsSuggestionsQuery } from "../../redux/api/user.api";
import SuggestionSkeleton, {
  SuggestionHeader,
} from "../../utils/skeletons/SuggestionSkeleton";
import MoHeader from "../../components/mobile/MoHeader";
import MoCommentBox from "../../components/mobile/MoCommentBox";

const Post = () => {
  useEffect(() => {
    document.title = "Instagram";
  }, []);

  const { data, isLoading } = useGetFriendPostQuery("");
  const { user } = useSelector((s: IRootState) => s.user);
  const isMobile = useSelector((s: IRootState) => s.mobile.open);

  const { data: suggest, isLoading: suggestLoading } =
    useGetFriendsSuggestionsQuery("");

  return (
    <div className="home">
      {isMobile ? <MoHeader /> : undefined}
      <Sidebar />
      <main className="home-post">
        <div>
          <div className="post-bar">
            {data?.posts.length && !isLoading ? (
              data?.posts.map((el) =><RenderPost key={el._id} data={el} />)
            ) : !data?.posts.length && isLoading ? (
              <FeedSkeleton />
            ) : undefined}
            {!isLoading ? (
              <div className="caught-up">
                <img src={CaughtUpIco} alt="caught-up-ico" />
                <div>
                  <span>You're all caught up</span>
                  <span>You've seen all new posts from the past days.</span>
                </div>
              </div>
            ) : undefined}
          </div>
          <div className="suggestion-bar">
            {!suggestLoading ? (
              <div className="switch-account">
                <div>
                  <img
                    src={user.avatar.url !== Null ? user.avatar.url : User}
                    alt="user-ico"
                  />
                  <div>
                    <p>{user.name}</p>
                    <span>{user.username}</span>
                  </div>
                </div>
                <span>Switch</span>
              </div>
            ) : (
              <SuggestionHeader />
            )}
            {suggest?.suggestions.length && !suggestLoading ? (
              <div className="suggest">
                <div className="suggest-header">
                  <b>Suggested for you</b>
                  {suggest?.suggestions.length ? (
                    <span>See All</span>
                  ) : undefined}
                </div>
                <div className="suggested-users">
                  {suggest.suggestions.map((el) => (
                    <div className="suggested" key={el._id}>
                      <div>
                        <img
                          src={el.avatar.url !== Null ? el.avatar.url : User}
                          alt="user-ico"
                        />
                        <div>
                          <p>{el.name}</p>
                          <span>{el.username}</span>
                        </div>
                      </div>
                      <span>Follow</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : !suggest?.suggestions.length && suggestLoading ? (
              <SuggestionSkeleton />
            ) : undefined}
            <SideBarFooter />
          </div>
        </div>
        <MainFooter />
      </main>
      <PostMask />
    </div>
  );
};

export default Post;
