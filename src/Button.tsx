import React from "react";
import "./Button.css";

interface ButtonProps {
  isLoading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ isLoading, onClick, children }) => {
  return (
    <button
      className={`custom-button ${isLoading ? "loading" : ""}`}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? <span className="spinner"></span> : children}
    </button>
  );
};

export default Button;
