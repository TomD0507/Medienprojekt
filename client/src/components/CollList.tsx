import React, { useState } from "react";

import "../styles/AddTask.css";
type CollListProps = {
  title: string;
  children: React.ReactNode;
};

export const CollList: React.FC<CollListProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleList = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="collapsible-list">
      <button className="collapsible-header menu-button" onClick={toggleList}>
        {title} {isOpen ? "-" : "+"}
      </button>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};
