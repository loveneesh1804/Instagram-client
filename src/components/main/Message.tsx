import { motion } from "framer-motion";
import { IMessageSocketType, IUserProfile } from "../../types";
import {
  dateFormat,
  fileFormat,
  PENDING,
  SKELETON,
  timeFormat,
} from "../../utlis";
import RenderContent, { RenderUploadingData } from "../common/RenderContent";
import { useEffect, useRef, useState } from "react";
import { IoCopyIcon, IoUnsendIcon, MoreIcon } from "../icon/Icons";
import { useDeleteMessageMutation } from "../../redux/api/chat.api";

type Props = {
  message: IMessageSocketType;
  user: IUserProfile;
};

const Message = ({ message, user }: Props) => {
  const { sender, content, attachments = [], createdAt, chatId,_id } = message;

  const sameSender = sender?._id === user?._id;

  const [showMore, setShowMore] = useState<boolean>(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [showMoreOptions, setShowMoreoptions] = useState<boolean>(false);

  const [deleteMsg] = useDeleteMessageMutation();

  const [mediaHeights, setMediaHeights] = useState<{ [key: number]: number }>(
    {}
  );

  const handleCopyText = (el: string) => {
    navigator.clipboard.writeText(el);
    return setShowMoreoptions(false);
  };

  const handleDeleteMsg = async() => {
    setShowMoreoptions(false);
    try{
      const {error} = await deleteMsg(_id);
      if(error) console.error("Something went wrong.");
    }catch(e){
      console.error(e);
    }
  }

  useEffect(() => {
    const mediaLoaders = document.querySelectorAll(".msg-box");

    mediaLoaders.forEach((el, index) => {
      const media = el.querySelector("img, video, audio") as HTMLElement;

      if (!media) return;

      const skeletonHeight = () => {
        const mediaHeight = media.clientHeight || media.offsetHeight;

        if (mediaHeight && mediaHeight !== mediaHeights[index]) {
          setMediaHeights((prev) => ({ ...prev, [index]: mediaHeight }));
        }
      };

      skeletonHeight();

      function loaded() {
        el.classList.add("loaded");
        skeletonHeight();
      }

      if (media.tagName === "IMG") {
        if ((media as HTMLImageElement).complete) {
          loaded();
        } else {
          media.addEventListener("load", loaded);
        }
      } else if (media.tagName === "VIDEO" || media.tagName === "AUDIO") {
        if ((media as HTMLVideoElement).readyState === 4) {
          loaded();
        } else {
          media.addEventListener("loadeddata", loaded);
        }
      }
    });
  }, [attachments, mediaHeights]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as HTMLElement)) {
        setShowMoreoptions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  return (
    <motion.div
      style={{
        alignSelf: sameSender ? "flex-end" : "flex-start",
        maxWidth: "350px",
      }}
      onMouseOver={() => setShowMore(true)}
      onMouseOut={() => setShowMore(false)}
      className={`${sameSender ? `sender` : "receiver"} 
      ${attachments.length ? "attachment" : ""}`}
    >
      {content && <p>{content}</p>}

      {attachments.length > 0 &&
        attachments.map((attachment, index) => {
          const url = attachment.url;
          const file = fileFormat(url);

          return (
            <div key={index}>
              <a
                href={url}
                target="_blank"
                download
                style={{
                  color: "black",
                  textDecoration: "none",
                  height: !document.querySelector(`.msg-box.loaded`)
                    ? `${mediaHeights[index]}px`
                    : "auto",
                }}
                className={`msg-box ${chatId === SKELETON ? "no-bgcolor" : ""}`}
              >
                {chatId === SKELETON
                  ? RenderUploadingData(
                      sender.name === PENDING
                        ? (attachment?.public_id?.split(".").pop() as string)
                        : fileFormat(url),
                      url,
                      sender.name
                    )
                  : RenderContent(file, url)}
              </a>
            </div>
          );
        })}

      <div className="option-section">
      {(showMore || showMoreOptions) && chatId!==SKELETON && (
        sameSender || attachments.length === 0
      ) ? (
        <div
          onMouseOver={() => setShowMore(true)}
          className={`more-msg-opt ${!sameSender ? "friend-msg" : ""}`}
        >
          <div onClick={() => setShowMoreoptions(true)}>
            <MoreIcon />
          </div>
        </div>
      ) : undefined}
      {showMoreOptions ? (
        <div ref={moreRef} className={`more-options ${!sameSender ? "friend-msg" : ""}`}>
          <div>{timeFormat(createdAt)} </div>
          {attachments.length === 0 ? (
            <div>
              <div onClick={() => handleCopyText(content)}>
                <span>Copy</span>
                <IoCopyIcon />
              </div>
            </div>
          ) : undefined}
          {sameSender ? <div className="unsend-section">
            <div onClick={handleDeleteMsg}>
              <span>Unsend</span>
              <IoUnsendIcon />
            </div>
          </div> : undefined}
        </div>
      ) : undefined}
      </div>
    </motion.div>
  );
};

export default Message;
