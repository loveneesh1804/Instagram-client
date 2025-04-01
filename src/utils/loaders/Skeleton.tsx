import { SkeletonTypes } from "../../types";

const Skeleton = ({ width, height, variant }: SkeletonTypes) => {
  return (
    <div
      className="skeleton"
      style={{
        width: width ? width : "0px",
        height: height ? height : "0px",
        borderRadius:
          variant === "Regular" ? "0px" : variant === "Rounded" ? "4px" : "50%",
      }}
    ></div>
  );
};

export default Skeleton;
