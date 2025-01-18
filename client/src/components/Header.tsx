import "../styles/Header.css";
import { faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";
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
  showBurger: boolean;
};

export function Header({
  onMenuToggle,
  onSearchToggle,
  deleteSearchQuery,
  delteFilter,
  searchQuery,
  filter,
  title,
  showBurger,
}: HeaderProps) {
  return (
    <header className="app_header">
      <div className="headerrow">
        {showBurger && (
          <button className="menu-button" onClick={onMenuToggle}>
            ☰
          </button>
        )}
        <h1 className="header-title">{title}</h1>
        <button className="search-button" onClick={onSearchToggle}>
          <FontAwesomeIcon icon={faFilter} className="icon" />
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
}
