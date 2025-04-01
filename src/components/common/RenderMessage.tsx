import { IMessageSocketType } from "../../types";
import { useSelector } from "react-redux";
import { IRootState } from "../../redux/store";
import { dateAgo, formatCaption } from "../../utlis";

const RenderMessage = ({ el }: { el: IMessageSocketType }) => {
  const { user } = useSelector((s: IRootState) => s.user);
  if(Object.keys(el).length === 0) return <></>;
  return (
    <span>
      {el?.attachments?.length
        ? `${
            el.sender._id === user._id ? "You" : el.sender.name
          } send an attachment.`
        : el?.content?.length > 50
        ? `${
            el.sender._id === user._id ? "You" : el.sender.name
          } ${formatCaption(el.content as string)}...`
        : `${el.sender._id === user._id ? "You" : el.sender.name}
         ${el.content}`}{" "}
      {el?.attachments?.length || el.content.length
        ? `· ${dateAgo(el.createdAt) || "Just Now"}`
        : undefined}
    </span>
  );
};

export default RenderMessage;
