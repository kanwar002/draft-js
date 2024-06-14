import React from "react";

const Button = ({ onSave }) => {
  return (
    <div className="button">
      <button onClick={onSave}>Save</button>
    </div>
  );
};

export default Button;
