import React from "react";
import "../styles/Header.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getFilterTextByKey } from "./FilterMenu";
type HeaderProps = {
  onMenuToggle: () => void;
  onSearchToggle: () => void;
  delteFilter: () => void;
  deleteSearchQuery: () => void;
  filter: string;
  title: string;
  searchQuery: string;
};

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onSearchToggle,
  deleteSearchQuery,
  delteFilter,
  searchQuery,
  filter,
  title,
}) => {
  return (
    <header className="app_header">
      <div className="headerrow">
        <button className="menu-button" onClick={onMenuToggle}>
          ☰
        </button>
        <h1 className="header-title">{title}</h1>
        <button className="search-button" onClick={onSearchToggle}>
          Filtern 🔍
        </button>
      </div>
      <div className="currentfilterview">
        {searchQuery.trimEnd() != "" && (
          <div className="filterdisplay">
            <div>
              Suche nach:
              <span>
                {searchQuery}
                <button
                  className="menu-button_small"
                  onClick={() => {
                    deleteSearchQuery();
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} className="icon" />
                </button>
              </span>
            </div>
          </div>
        )}
        {filter != "all" && (
          <div className="filterdisplay">
            <div>
              Filter:
              <span>
                {getFilterTextByKey(filter)}
                <button
                  className="menu-button_small"
                  onClick={() => {
                    delteFilter();
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} className="icon" />
                </button>
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
