import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMorePostQuery } from "../../redux/api/post.api";
import { IoComment, IoHeart, IoLayerFill } from "../icon/Icons";

const MorePost = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const {id : postId} = useParams();
  const { data, isError } = useMorePostQuery(postId || '');

  useEffect(() => {
    const imgLoaders = document.querySelectorAll(".img-loader");
    imgLoaders.forEach((el) => {
      const img = el.querySelector("img");

      function loaded() {
        el.classList.add("loaded");
      }
      if (img?.complete) {
        loaded();
      } else {
        img?.addEventListener("load", loaded);
      }
    });
  }, [data?.data]);

  return !isError && data?.data.length ? (
    <div className="more-post-box">
      <span>
        More posts from{" "}
        <b onClick={() => navigate(`/${id}`)}>{data?.username}</b>
      </span>
      <div className="more-post">
        {data.data.map((el) => (
          <div
            onClick={() => navigate(`/p/${el._id}`)}
            key={el._id}
            className="img-loader"
          >
            <img src={el.resources[0].url} alt="post-nail" />
            <div className="post-counts">
              <div>
                <IoHeart />
                {el.likes.length}
              </div>
              <div>
                <IoComment />
                {el.comments.length}
              </div>
            </div>
            {el.resources.length > 1 ? <IoLayerFill /> : undefined}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default MorePost;
