import React from "react";

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
      <button className="menu-button" onClick={onMenuToggle}>
        ☰
      </button>
      <h1 className="header-title">{title}</h1>
      <button className="search-button" onClick={onSearchToggle}>
        🔍
      </button>
    </header>
  );
};
