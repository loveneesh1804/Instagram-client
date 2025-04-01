import React, { useEffect, useState } from "react";
import User from "../assets/images/user.png";
import { LikesType } from "../types";
import MoCommentSkeleton from "../utils/skeletons/MoCommentSkeleton";
import { IoInfoOutline } from "../components/icon/Icons";
import { Null } from "../event";
import { useSelector } from "react-redux";
import { IRootState } from "../redux/store";
import { useLazyGetFollowersQuery, useLazyGetFollowingsQuery } from "../redux/api/user.api";

const UsersMask = ({
  setOpen,
  open,
  type,
  id
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  type: "Follower" | "Following",
  id: string | undefined;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<LikesType[]>([]);

  const isMobile = useSelector((state:IRootState)=>state.mobile.open);

  const handleClose = () => {
    setOpen(false);
  };

  const [getFollowers] = useLazyGetFollowersQuery();
  const [getFollowings] = useLazyGetFollowingsQuery();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if(type==="Follower"){
        const {data} = await getFollowers(id as string);
        if(data?.data){
            setData(data?.data.followers);
        }
      }else{
        const {data} = await getFollowings(id as string);
        if(data?.data){
            setData(data?.data.followings);
        }
      }
      setLoading(false);
    };
    (id && id.length) && fetchData();
  }, [type,id]);

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
          <h2>{type}</h2>
          <IoInfoOutline />
        </div>
        <div className="likes-section">
          {data.length && !loading ? (
            data.map((el) => (
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
          ) : (!data.length && loading) ? (
            <MoCommentSkeleton />
          ) : (
            <div className="no-comments-box mobile-no-cmt">
              <h2>No {type} yet.</h2>
              <span>Start explorings users.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersMask;
