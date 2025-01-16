import React from "react";

import "../styles/AddTask.css";
type CollListProps = {
  visible: boolean;
  children: React.ReactNode;
};

export const CollList: React.FC<CollListProps> = ({ visible, children }) => {
  return <>{visible && <div className="">{children}</div>}</>;
};
