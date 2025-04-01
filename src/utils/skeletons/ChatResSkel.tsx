import Skeleton from "../loaders/Skeleton";

const ChatResSkel = () => {
  return (
    <div className="chat-search-skeleton">
      {new Array(7).fill(1).map((el, i) => (
        <div key={i}>
          <Skeleton variant="Circular" width="44px" height="44px" />
          <div>
            <Skeleton variant="Rounded" width="85%" height="14px" />
            <Skeleton variant="Rounded" width="65%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatResSkel;
