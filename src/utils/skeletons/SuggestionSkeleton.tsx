import React from "react";
import Skeleton from "../loaders/Skeleton";

const SuggestionSkeleton = () => {
  return (
    <div className="suggest-skeleton">
      {new Array(5).fill(0).map((el, i) => (
        <div key={i}>
          <Skeleton width="40px" height="40px" variant="Circular" />
          <div>
            <Skeleton width="180px" height="12.5px" variant="Rounded" />
            <Skeleton width="130px" height="12.5px" variant="Rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
export default SuggestionSkeleton;


export const SuggestionHeader = () => (
  <div className="suggestion-header-skeleton">
    <Skeleton width="50px" height="50px" variant="Circular" />
    <div>
      <Skeleton width="180px" height="13px" variant="Rounded" />
      <Skeleton width="130px" height="13px" variant="Rounded" />
    </div>
  </div>
);

