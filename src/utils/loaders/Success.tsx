const Success = ({ success }: { success: boolean }) => {
  return (
    <div className="spinner-tick">
      <div className="tick-container">
        <div className="short-line"
          style={{
            animation : success ? 'draw-tick 0.4s forwards' : ''
          }}></div>
        <div
          className="long-line"
          style={{
            animation: success ? "draw-long-tick 0.2s 0.5s ease-out forwards" : "",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Success;
