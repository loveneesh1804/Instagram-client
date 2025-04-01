import Skeleton from "../loaders/Skeleton";

const PostSkeleton = () => (
    <div className="post-mask-skeleton">
      <div>
        <Skeleton width="100%" height="100%" variant="Regular" />
      </div>
      <div>
        <div className="post-header-skeleton">
          <Skeleton width="35px" height="35px" variant="Circular" />
          <div>
            <Skeleton width="180px" height="12px" variant="Regular" />
            <Skeleton width="120px" height="12px" variant="Regular" />
          </div>
        </div>
        <div></div>
        <div>
          <Skeleton width="150px" height="18px" variant="Regular" />
          <Skeleton width="250px" height="18px" variant="Regular" />
          <Skeleton width="100px" height="18px" variant="Regular" />
        </div>
      </div>
    </div>
  );

export default PostSkeleton