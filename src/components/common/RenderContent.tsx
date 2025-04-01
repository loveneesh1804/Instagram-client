import { IAttachments } from "../../types";
import { PENDING, transformImage } from "../../utlis";
import { FileIcon, IoShareOutline } from "../icon/Icons";

const RenderContent = (file: IAttachments, url: string) => {
  switch (file) {
    case "image":
      return (
        <img
          src={transformImage(url, 500)}
          loading="lazy"
          alt="attachment-ico"
          style={{ objectFit: "cover", maxWidth: "250px", maxHeight: "375px" }}
        />
      );

    case "video":
      return <video src={url} style={{ maxWidth: "250px" }} controls />;

    case "audio":
      return <audio src={url} controls />;

    case "file":
      return (
        <div className="file-ico">
          <div>
            <FileIcon />
            <span>{file}</span>
          </div>
          <div>
            <p>{url.split("/").pop()}</p>
            <span>{url.split(".").pop()}</span>
          </div>
        </div>
      );
  }
};

export const RenderUploadingData = (
  file: string,
  url: string,
  createdAt: string
) => {
  switch (file) {
    case "image":
      return (
        <>
          <img
            src={createdAt===PENDING ? url : transformImage(url, 500)}
            style={{
              objectFit: "cover",
              maxWidth: "250px",
              maxHeight: "375px",
            }}
          />
          {createdAt === PENDING ? (
            <IoShareOutline width={12} height={12} />
          ) : undefined}
        </>
      );

    case "video":
      return (
        <>
          <video src={url} style={{ maxWidth: "250px" }} controls />
          {createdAt === PENDING ? (
            <IoShareOutline width={12} height={12} />
          ) : undefined}
        </>
      );

    case "audio":
      return (
        <>
          <audio src={url} controls />
          {createdAt === PENDING ? (
            <IoShareOutline width={12} height={12} />
          ) : undefined}
        </>
      );

    case "file":
      return (
        <div className="file-ico">
          <div>
            <FileIcon />
            <span>{file}</span>
          </div>
          <div>
            <p>{url.split("/").pop()}</p>
            <span>{url.split(".").pop()}</span>
          </div>
        </div>
      );
  }
};

export default RenderContent;
