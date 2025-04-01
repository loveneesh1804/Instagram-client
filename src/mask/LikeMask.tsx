import React, { useEffect, useState } from "react";
import User from "../assets/images/user.png";
import { useLazyGetLikesQuery } from "../redux/api/post.api";
import { LikesType } from "../types";
import MoCommentSkeleton from "../utils/skeletons/MoCommentSkeleton";
import { IoInfoOutline } from "../components/icon/Icons";
import { Null } from "../event";
import { useSelector } from "react-redux";
import { IRootState } from "../redux/store";

const LikeMask = ({
  setId,
  setOpen,
  id,
  open,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  setId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [likes, setLikes] = useState<LikesType[]>([]);

  const isMobile = useSelector((state:IRootState)=>state.mobile.open);

  const handleClose = () => {
    setOpen(false);
    setId("");
  };

  const [getLikes] = useLazyGetLikesQuery();

  useEffect(() => {
    const fetchLikes = async () => {
      setLoading(true);
      const { data } = await getLikes(id);
      if (data?.success) {
        setLikes(data.data.likes);
      }
      setLoading(false);
    };
    id.length && fetchLikes();
  }, [id]);

  return (
    <div
      className="likes-box-mask"
      onClick={(e) =>
        (e.target as HTMLDivElement).className === "likes-box-mask"
          ? handleClose()
          : undefined
      }
      style={{
        visibility: open ? "visible" : "hidden",
        pointerEvents: open ? "all" : "none",
      }}
    >
      <div
        className={`likes-box ${!isMobile ? 'pc-likes-box' : ''}`}
        style={{ opacity: open ? 1 : 0, bottom: open ? "0" : "-100%" }}
      >
        <div className="likes-head"
        style={{borderBottom: !isMobile ? "1px solid rgb(219,219,219)" : ''}}>
          <span></span>
          <h2>Likes</h2>
          <IoInfoOutline />
        </div>
        <div className="likes-section">
          {likes.length && !loading ? (
            likes.map((el) => (
              <div className="mobile-likes" key={el._id}>
                <img
                  src={el.avatar.url !== Null ? el.avatar.url : User}
                  alt="user-ico"
                />
                <div>
                  <div>
                    <p>{el.name}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (!likes.length && loading) ? (
            <MoCommentSkeleton />
          ) : (
            <div className="no-comments-box mobile-no-cmt">
              <h2>No Likes yet.</h2>
              <span>Start the conversation.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikeMask;
