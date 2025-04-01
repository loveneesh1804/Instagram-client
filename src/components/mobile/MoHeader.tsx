import React from "react";
import { IoHeartOutline, IoLogo } from "../icon/Icons";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../redux/store";
import { notify } from "../../redux/slice/sidebar";
import { useNavigate } from "react-router-dom";

const MoHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="mobile-header">
      <span onClick={() => navigate("/")}>
        <IoLogo />
      </span>
      <span onClick={() => dispatch(notify())}>
        <IoHeartOutline />
      </span>
    </div>
  );
};

export default MoHeader;
