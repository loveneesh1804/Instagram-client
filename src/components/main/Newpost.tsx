import { motion } from "framer-motion";
import { IRootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import User from "../../assets/images/user.png";
import {
  IoAddFiles,
  IoAddOutline,
  IoBackOutline,
  IoDeleteOutline,
  IoExclamationOutline,
  IoLeftChevron,
  IoPost,
  IoResizeIco,
  IoRightChevron,
} from "../icon/Icons";
import { IoCloseOutline } from "../icon/Icons";
import { closePost } from "../../redux/slice/sidebar";
import { useEffect, useRef, useState } from "react";
import { PreviewFile, ResponseCommonType } from "../../types";
import { Reorder } from "framer-motion";
import { newLineStrFormat, Null } from "../../utlis";
import { useNewPostMutation } from "../../redux/api/post.api";
import Success from "../../utils/loaders/Success";
import { toast } from "../../utils/alert/Toast";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { refetchPost } from "../../redux/slice/refetch";

const Newpost = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [currentPrev, setCurrentPrv] = useState<number>(0);
  const [sizeErr, setSizeErr] = useState<string>("");
  const [view, setView] = useState<boolean>(false);
  const [showPrev, setShowPrev] = useState<boolean>(false);
  const [showNext, setShowNext] = useState<boolean>(true);
  const [crop, setCrop] = useState<boolean>(false);
  const [showCaption, setShowCaption] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLUListElement>(null);

  const dispatch = useDispatch();
  const { post } = useSelector((state: IRootState) => state.sidebar);
  const { user } = useSelector((state: IRootState) => state.user);
  const isMobile = useSelector((state: IRootState) => state.mobile.open);
  const [createPost] = useNewPostMutation();

  const updateBtnView = () => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;

      setShowPrev(scrollLeft > 0);
      setShowNext(scrollLeft + clientWidth < scrollWidth);
    }
  };
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const resources = e.target.files as FileList;
    if (resources.length === 0) return;
    for (var i = 0; i < resources.length; i++) {
      const data = resources[i];
      const dataType = data.type.split("/")[0];
      if (dataType !== "image" && dataType !== "video") continue;
      if (data.size < 1024 * 1024 * 10) {
        sizeErr.length && setSizeErr("");
        setCurrentPrv(0);
        if (!files.some((el) => el.name === data.name)) {
          setFiles((prev) => [...prev, data]);
          setPreviewFiles((prev) => [
            ...prev,
            {
              name: data.name,
              url: URL.createObjectURL(data),
              type: dataType,
            },
          ]);
          updateBtnView();
        }
      } else {
        setFiles([]);
        setPreviewFiles([]);
        setShowCaption(false);
        setCaption("");
        return setSizeErr(data.name);
      }
    }
  };
  const handleOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((e.target as HTMLDivElement).className === "new-post-mask") {
      handleClose();
    }
  };
  const handleDelete = (itm: string) => {
    setPreviewFiles(previewFiles.filter((el) => el.name !== itm));
    setFiles(files.filter((el) => el.name !== itm));
    if (carouselRef.current && previewFiles.length > 4) {
      carouselRef.current.scrollLeft = 0;
    }
    setCurrentPrv(0);
    updateBtnView();
  };
  const handleReorder = (newFiles: PreviewFile[]) => {
    setPreviewFiles(newFiles);
    var tempArr: File[] = [];
    for (var i = 0; i < newFiles.length; i++) {
      for (var j = 0; j < files.length; j++) {
        if (newFiles[i].name === files[j].name) {
          tempArr.push(files[j]);
        }
      }
    }
    setFiles(tempArr);
  };
  const handleNextClick = () => {
    carouselRef.current!.scrollLeft += carouselRef.current!.clientWidth + 13;
    updateBtnView();
  };
  const handlePrevClick = () => {
    carouselRef.current!.scrollLeft -= carouselRef.current!.clientWidth + 13;
    updateBtnView();
  };
  const handleClose = () => {
    if (loading && !success) {
      return;
    }
    if (files.length || previewFiles.length) {
      setFiles([]);
      setPreviewFiles([]);
      setCurrentPrv(0);
      setLoading(false);
      setSuccess(false);
      setShowCaption(false);
      dispatch(closePost());
    } else {
      setLoading(false);
      setSuccess(false);
      setShowCaption(false);
      dispatch(closePost());
    }
  };
  const handleNewPost = async () => {
    try {
      setShowCaption(false);
      setLoading(true);
      const formData = new FormData();
      if (caption) {
        formData.append("caption", newLineStrFormat(caption));
      }
      formData.append("view", crop ? "contain" : "cover");
      if (files.length) {
        for (const file of files) {
          formData.append("files", file);
        }
      }
      const { error } = await createPost(formData);
      if (error) {
        toast(
          ((error as FetchBaseQueryError).data as ResponseCommonType).message
        );
        setLoading(false);
      }
      dispatch(refetchPost());
      setSuccess(true);
      return setCaption("");
    } catch {
      toast("Something Went Wrong!");
      return setSuccess(false);
    }
  };
  const handleBack = () => {
    setShowCaption(false);
    setCaption("");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as HTMLElement) && view) {
        setView(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

  useEffect(() => {
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
  }, [previewFiles]);

  useEffect(() => {
    updateBtnView();
  }, [previewFiles]);

  return (
    <div
      onClick={handleOutside}
      className="new-post-mask"
      style={{ visibility: post ? "visible" : "hidden" }}
    >
      {
        <span onClick={handleClose}>
          <IoCloseOutline />
        </span>
      }
      <div
        className="new-post"
        style={{ width: showCaption ? "58.5%" : "36%" }}
      >
        <div className="new-post-header">
          {previewFiles.length && !loading ? (
            <b onClick={() => (!showCaption ? handleClose() : handleBack())}>
              <IoBackOutline />
            </b>
          ) : undefined}
          <p>
            {sizeErr.length && !loading
              ? "File couldn't be uploaded"
              : !sizeErr.length && loading
              ? "Sharing"
              : "Create new post"}
          </p>
          {previewFiles.length && !loading ? (
            caption.length && files.length ? (
              <span onClick={handleNewPost}>Share</span>
            ) : (
              <span onClick={() => setShowCaption(true)}>Next</span>
            )
          ) : undefined}
        </div>
        {!previewFiles.length && !loading ? (
          <div className="add-post-itm">
            {!sizeErr.length ? <IoPost /> : <IoExclamationOutline />}
            <span>
              {!sizeErr.length
                ? "Select photos and videos here"
                : "File must be 10MB or less"}
            </span>
            {sizeErr.length ? (
              <p>
                <b>{sizeErr}</b> is too large. To continue, choose a file that's
                1GB or less.
              </p>
            ) : undefined}
            <motion.button
              className="upload-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: post ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <input
                type="file"
                onChange={handleFiles}
                multiple
                accept="image/*, video/*"
              />
              {!sizeErr.length ? "Select from computer" : "Select other files"}
            </motion.button>
          </div>
        ) : previewFiles.length && !loading ? (
          <div className="new-post-content">
            <div
              className="upload-image-prev"
              style={{
                width:
                  showCaption && !isMobile
                    ? "62.5%"
                    : showCaption && isMobile
                    ? "0%"
                    : "100%",
                display: showCaption && isMobile ? "none" : "block",
              }}
            >
              {previewFiles[currentPrev]?.type === "image" ? (
                <img
                  src={previewFiles[currentPrev]?.url}
                  alt="prev-ico"
                  style={{
                    objectFit: crop ? "contain" : "cover",
                    borderBottomRightRadius: showCaption ? "0px" : "10px",
                  }}
                />
              ) : (
                <video
                  src={previewFiles[currentPrev]?.url}
                  style={{
                    borderBottomRightRadius: showCaption ? "0px" : "10px",
                  }}
                  autoPlay
                  loop
                ></video>
              )}
              {currentPrev !== 0 ? (
                <button
                  className="prev-btn"
                  onClick={() => setCurrentPrv((prev) => prev - 1)}
                >
                  <IoLeftChevron />
                </button>
              ) : undefined}
              {currentPrev !== previewFiles.length - 1 ? (
                <button
                  className="next-btn"
                  onClick={() => setCurrentPrv((prev) => prev + 1)}
                >
                  <IoRightChevron />
                </button>
              ) : undefined}
              {previewFiles.length > 1 ? (
                <div className="slide-dots">
                  {new Array(previewFiles.length).fill(0).map((el, i) => (
                    <div
                      style={{
                        backgroundColor:
                          currentPrev === i ? "#0095F6" : "#A8A8A8",
                      }}
                      className="dots"
                      key={i}
                    ></div>
                  ))}
                </div>
              ) : undefined}
              <div className="file-summary">
                <div
                  className="file-layer-ico"
                  style={{
                    backgroundColor: view ? "white" : "rgba(26, 26, 26, .8)",
                    pointerEvents: view ? "none" : "all",
                  }}
                  onClick={() => setView(true)}
                >
                  <IoAddFiles
                    className={view ? "layer-ico white" : "layer-ico"}
                  />
                </div>
                <div
                  ref={containerRef}
                  className={view ? `layer-preview animate` : "layer-preview"}
                  style={{
                    pointerEvents: view ? "all" : "none",
                    maxWidth: isMobile ? "320px" : "500px",
                  }}
                >
                  <div>
                    <Reorder.Group
                      ref={carouselRef}
                      axis="x"
                      values={previewFiles}
                      onReorder={handleReorder}
                      className="carousel"
                      style={{ maxWidth: isMobile ? "201px" : "415px" }}
                    >
                      {previewFiles.map((el, i) => (
                        <Reorder.Item
                          value={el}
                          drag="x"
                          key={el.name}
                          id={el.name}
                          onMouseUp={() => setCurrentPrv(i)}
                        >
                          <div
                            className="small-prev"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentPrv(i);
                            }}
                            style={{
                              opacity: currentPrev === i ? 1 : 0.6,
                              backgroundColor:
                                currentPrev === i
                                  ? "transparent"
                                  : "rgb(26,26,26)",
                            }}
                          >
                            <img tabIndex={1} src={el.url} alt="prev-ico" />
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(el.name);
                              }}
                            >
                              <IoDeleteOutline />
                            </div>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                    {(!isMobile && previewFiles.length > 4) ||
                    (isMobile && previewFiles.length > 1) ? (
                      <>
                        {showNext ? (
                          <button className="next" onClick={handleNextClick}>
                            <IoRightChevron />
                          </button>
                        ) : undefined}
                        {showPrev ? (
                          <button className="prev" onClick={handlePrevClick}>
                            <IoLeftChevron />
                          </button>
                        ) : undefined}
                      </>
                    ) : undefined}
                  </div>
                  <div className="add-more-btn">
                    <input
                      type="file"
                      onChange={handleFiles}
                      multiple
                      accept="image/*, video/*"
                    />
                    <IoAddOutline />
                  </div>
                </div>
              </div>
              <div
                className="file-view"
                onClick={() => setCrop((prev) => !prev)}
                style={{
                  backgroundColor: crop ? "white" : "rgba(26, 26, 26, .8)",
                }}
              >
                <IoResizeIco
                  className={crop ? "layer-ico white" : "layer-ico"}
                />
              </div>
            </div>
            {showCaption ? (
              <div
                className="new-post-caption"
                style={{
                  width:
                    showCaption && !isMobile
                      ? "37.5%"
                      : showCaption && isMobile
                      ? "100%"
                      : "0%",
                  opacity: showCaption ? "1" : "0",
                  pointerEvents: showCaption ? "all" : "none",
                  visibility: showCaption ? "visible" : "hidden",
                  borderColor: isMobile ? "transparent" : "#c7c7c7",
                }}
              >
                <div className="caption-head">
                  <img
                    src={user.avatar.url !== Null ? user.avatar.url : User}
                    alt=""
                  />
                  <b>{user.name}</b>
                </div>
                <textarea
                  value={caption}
                  placeholder="Caption..."
                  onChange={(e) =>
                    e.target.value.length < 2200
                      ? setCaption(e.target.value)
                      : setCaption(e.target.value.slice(0, 2200))
                  }
                  className="caption-box"
                ></textarea>
                <div className="caption-count">
                  <span>{caption.length.toLocaleString("en-IN")}/2,200</span>
                </div>
              </div>
            ) : undefined}
          </div>
        ) : loading ? (
          <div className="sharing-loader">
            <Success success={success} />
            {success ? <p>Your post has been shared.</p> : undefined}
          </div>
        ) : undefined}
      </div>
    </div>
  );
};

export default Newpost;
