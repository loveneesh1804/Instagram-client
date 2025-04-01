import { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/main/Sidebar";
import { MainFooter } from "../../components/common/Footer";
import { IoComment, IoHeart, IoNoPostIco } from "../../components/icon/Icons";
import { useLazyExplorePostQuery } from "../../redux/api/post.api";
import BigSpinner from "../../utils/loaders/BigSpinner";
import { IPostMinType } from "../../types";
import PostMask from "../../mask/PostMask";
import { openMask } from "../../redux/slice/mask";
import { useDispatch, useSelector } from "react-redux";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { IRootState } from "../../redux/store";
import MoHeader from "../../components/mobile/MoHeader";
import { useNavigate } from "react-router-dom";

const All = () => {
  useEffect(() => {
    document.title = "Explore";
  }, []);

  const isMobile = useSelector((s: IRootState) => s.mobile.open);

  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IPostMinType[]>([]);
  const [imgLoaded, setImgLoaded] = useState<boolean[]>([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [fetchExplorePost] = useLazyExplorePostQuery();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await fetchExplorePost(page);
      if (data?.success) {
        setData(data.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [page]);

  const handlePost = (i: string) => {
    if(isMobile){
      navigate(`/p/${i}`);
    }else{
      const payload = {
        open: true,
        id: i,
      };
      dispatch(openMask(payload));
    }
  };

  const handleImageLoad = (index: number) => {
    setImgLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  return (
    <>
      <div className="explore">
        {isMobile ? <MoHeader /> : undefined}
        <Sidebar />
        <main className="explore-box">
          {!loading && data.length ? (
            <div className="explore-contents">
              {data.map((el, i) => (
                <div
                  onClick={() => handlePost(el._id)}
                  key={el._id}
                  className={`explore-post ${imgLoaded[i] ? "loaded" : ""}`}
                  style={{
                    gridRow:
                      (i + 1) % 10 === 1 || (i + 1) % 10 === 8
                        ? "span 2"
                        : "span 1",
                  }}
                >
                  <img
                    style={{
                      height:
                        ((i + 1) % 10 === 1 || (i + 1) % 10 === 8) && !isMobile
                          ? "635px"
                          : ((i + 1) % 10 === 1 || (i + 1) % 10 === 8) &&
                            isMobile
                          ? "275px"
                          : isMobile
                          ? "135px"
                          : "316px",
                    }}
                    loading="lazy"
                    src={el.resources}
                    alt={"post-thumbnail"}
                    onLoad={() => handleImageLoad(i)}
                  />
                  <div className="like-count">
                    <div>
                      <IoHeart />
                      {el.likes}
                    </div>
                    <div>
                      <IoComment />
                      {el.comments}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : loading && !data.length ? (
            <div className="explore-loading">
              <BigSpinner />
            </div>
          ) : (
            <div className="explore-no-post">
              <IoNoPostIco />
              <h1>No Posts Yet</h1>
              <span>Cannot find any posts.</span>
            </div>
          )}
          <MainFooter />
        </main>
      </div>
      <PostMask />
    </>
  );
};

export default All;
