import React from "react";
import "../styles/PwallHeader.css";
import { faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getFilterTextByKey } from "./FilterMenu";
import { PixelWall } from "../pwall/PixelWall";
type PwallHeaderProps = {};

export const PwallHeader: React.FC<PwallHeaderProps> = ({}) => {
  return (
    <header className="app_header">
      <div className="headerrow">
        <h1 className="header-title">PixelWall</h1>
        <button className="search-button" onClick={() => {}}>
          <FontAwesomeIcon icon={faFilter} className="icon" />
        </button>
      </div>
      <div className="currentfilterview"></div>
    </header>
  );
};
