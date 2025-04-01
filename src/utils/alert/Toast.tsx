import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IRootState, store } from "../../redux/store";
import { closeToast, openToast } from "../../redux/slice/toast.slice";

const Toast = () => {
  const { open, msg } = useSelector((state: IRootState) => state.toast);

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [hovered, setHovered] = useState(false); 

  useEffect(() => {
    if (open && !hovered) {
      const timeout = setTimeout(() => {
        store.dispatch(closeToast());
      }, 5000);

      setTimer(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open, hovered]);

  const handleMouseEnter = () => {
    setHovered(true);
    if (timer) {
      clearTimeout(timer);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="toast"
      style={{ bottom: open ? "0px" : "-100%" }}
    >
      <p>{msg}</p>
    </div>
  );
};
export const toast = (msg: string) => {
  store.dispatch(openToast({ msg, open: true }));
};

export default Toast;
