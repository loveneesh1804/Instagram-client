import React from "react";
import Sidebar from "../../components/main/Sidebar";
import { useNavigate } from "react-router-dom";
import { MainFooter } from "../../components/common/Footer";

const Notfound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <Sidebar />
      <div>
        <div className="not-found-msg">
          <p>Sorry, this page isn't available.</p>
          <span>
            The link you followed may be broken, or the page may have been
            removed. <b onClick={() => navigate("/")}>Go back to Instagram.</b>
          </span>
        </div>
        <MainFooter />
      </div>
    </div>
  );
};

export default Notfound;
