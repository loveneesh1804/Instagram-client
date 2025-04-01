import { useSelector } from "react-redux";
import Skeleton from "../loaders/Skeleton";
import { IRootState } from "../../redux/store";

const NotificationSkeletion = () => {
  const isMobile = useSelector((state: IRootState) => state.mobile.open);

  return (
    <div className="notification-skeleton">
      {!isMobile ? <Skeleton variant="Rounded" width="30%" height="16px" /> : undefined}
      <div className="notify-el-skel">
        {new Array(12).fill(0).map((el, i) => (
          <div key={i}>
            <Skeleton variant="Circular" width="44px" height="44px" />
            <Skeleton variant="Rounded" width="70%" height="14px" />
            <Skeleton variant="Rounded" width="47px" height="47px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSkeletion;
