import React from "react";
import "./Button.css";

interface ButtonProps {
  loadState: "idle" | "loading" | "success" | "error";
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ loadState, onClick }) => {
  return (
    <button
      className={`custom-button ${loadState}`}
      onClick={onClick}
      disabled={loadState != "idle"}
    >
      {loadState == "idle" && <span>送信する</span>}
      {loadState == "loading" && <span className="spinner"></span>}
      {loadState == "success" && <span>Success</span>}
      {loadState == "error" && <span>Error</span>}
    </button>
  );
};

export default Button;
