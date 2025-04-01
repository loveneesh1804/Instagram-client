import React, { useState } from "react";
import { useSelector } from "react-redux";
import { IRootState } from "../../redux/store";
import { Null, toOriginalStr } from "../../utlis";
import { IPropsMaskPost } from "../../types";

const MoProfileHeader = ({
  postNo,
  handleShowUser,
  follower,
  following,
  bio,
  name
}: IPropsMaskPost) => {
  return (
    <div className="mobile-profile-header">
      <div>
        <b>{name}</b>
        <span className="bio-section">
          {bio === Null
            ? ""
            : bio
            ? toOriginalStr(bio).map((el, i) => <p key={i}>{el}</p>)
            : undefined}
        </span>
      </div>
      <div>
        <span >
          <b>{postNo}</b> <span>posts</span>
        </span>
        <span onClick={() => handleShowUser("Follower")}>
          <b>{follower}</b> <span>followers</span>
        </span>
        <span onClick={() => handleShowUser("Following")}>
          <b>{following}</b> <span>following</span>
        </span>
      </div>
    </div>
  );
};

export default MoProfileHeader;
