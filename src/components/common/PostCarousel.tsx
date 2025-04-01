import React, { useEffect, useRef, useState } from "react";
import { IPostType, IPostTypeFeed } from "../../types";
import { IoLeftChevron, IoRightChevron } from "../icon/Icons";

const PostCarousel = ({ data }: { data: IPostTypeFeed | IPostType }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState<boolean>(false);
  const [showNext, setShowNext] = useState<boolean>(false);
  const [currentPrev, setCurrentPrev] = useState<number>(0);
  const [imgLoaded, setImgLoaded] = useState<boolean[]>([]);

  const updateBtnView = () => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;

      setShowPrev(scrollLeft > 0);
      setShowNext(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  const handleNextClick = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += carouselRef.current.clientWidth;
      setCurrentPrev((prev) => prev + 1);
    }
  };

  const handlePrevClick = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= carouselRef.current.clientWidth;
      setCurrentPrev((prev) => prev - 1);
    }
  };

  const handleImageLoad = (index: number) => {
    setImgLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  useEffect(() => {
    updateBtnView();
  }, [currentPrev]);

  useEffect(() => {
    if (data && data.resources.length > 1) {
      setShowNext(true);
    }

    const handleScroll = () => {
      updateBtnView();
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener("scroll", handleScroll);
      }
    };
  }, [data]);
  return (
    <>
      <div ref={carouselRef} className="post-feed-carousel">
        {data.resources.map((e, i) => (
          <div className="post-feed-card" key={e.public_id}>
            <div className={`img-loader ${imgLoaded[i] ? "loaded" : ""}`}>
              <img
                style={{ objectFit: data.view }}
                src={e.url}
                alt="post-prev"
                loading="lazy"
                onLoad={() => handleImageLoad(i)}
              />
            </div>
          </div>
        ))}
      </div>
      {showPrev ? (
        <button className="prev-btn" onClick={handlePrevClick}>
          <IoLeftChevron />
        </button>
      ) : undefined}
      {showNext ? (
        <button className="next-btn" onClick={handleNextClick}>
          <IoRightChevron />
        </button>
      ) : undefined}
      {data.resources.length > 1 ? (
        <div className="slider-dots-box">
          {new Array(data.resources.length).fill(0).map((el, i) => (
            <div
              style={{
                backgroundColor:
                  currentPrev === i ? "white" : "rgba(255,255,255,0.4)",
              }}
              className="grey-dots"
              key={i}
            ></div>
          ))}
        </div>
      ) : undefined}
    </>
  );
};

export default PostCarousel;
