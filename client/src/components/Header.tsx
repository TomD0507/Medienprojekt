import React from "react";
import "../styles/Header.css";
type HeaderProps = {
  onMenuToggle: () => void;
  onSearchToggle: () => void;
  filter: string;
  title: string;
};

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onSearchToggle,
  title,
}) => {
  return (
    <header className="app_header">
      <div className="buttoncontainer">
        <button className="menu-button" onClick={onMenuToggle}>
          ☰
        </button>
      </div>
      <h1 className="header-title">{title}</h1>
      <div className="buttoncontainer">
        <button className="search-button" onClick={onSearchToggle}>
          Filtern 🔍
        </button>
      </div>
    </header>
  );
};
