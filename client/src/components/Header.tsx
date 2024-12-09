import React from "react";

type HeaderProps = {
  onMenuToggle: () => void;
  onSearchToggle: () => void;
  filter: string;
};

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onSearchToggle,
}) => {
  return (
    <header className="app_header">
      <button className="menu-button" onClick={onMenuToggle}>
        ☰
      </button>
      <h1 className="header-title">Start</h1>
      <button className="search-button" onClick={onSearchToggle}>
        🔍
      </button>
    </header>
  );
};
