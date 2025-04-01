import React from "react";
import Skeleton from "../loaders/Skeleton";

const MoCommentSkeleton = () => {
  return (
    <>
      {new Array(10).fill(0).map((el, i) => (
        <div key={i} className="mobile-comment-skeleton">
          <Skeleton width="40px" height="40px" variant="Circular" />
          <div>
            <Skeleton width="200px" height="12px" variant="Rounded" />
            <Skeleton width="130px" height="12px" variant="Rounded" />
          </div>
        </div>
      ))}
    </>
  );
};

export default MoCommentSkeleton;
