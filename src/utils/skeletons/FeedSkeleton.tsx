import React from "react";
import Skeleton from "../loaders/Skeleton";
import { useSelector } from "react-redux";
import { IRootState } from "../../redux/store";

const FeedSkeleton = () => {
  const isMobile = useSelector((s: IRootState) => s.mobile.open);
  return (
    <div className="home-page-skeleton">
      {new Array(3).fill(0).map((el, i) => (
        <div className="post-feed-skeleton" key={i}>
          <div>
            <Skeleton
              width={isMobile ? "44px" : "34px"}
              height={isMobile ? "44px" : "34px"}
              variant="Circular"
            />
            <div>
              <Skeleton
                width={isMobile ? "200px" : "150px"}
                height={isMobile ? "13px" : "12px"}
                variant="Rounded"
              />
              <Skeleton
                width={isMobile ? "150px" : "100px"}
                height={isMobile ? "13px" : "12px"}
                variant="Rounded"
              />
            </div>
          </div>
          <Skeleton width="100%" height={isMobile ? "500px" : "400px"} variant="Rounded" />
        </div>
      ))}
    </div>
  );
};

export default FeedSkeleton;
