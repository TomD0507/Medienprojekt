import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";
import { faInfinity } from "@fortawesome/free-solid-svg-icons/faInfinity";
import {
  faBook,
  faCalendarDay,
  faCalendarWeek,
  faExclamation,
  faCheckCircle,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const [isVisible, setIsVisible] = useState(false);


//Funktion für Visibility des X
const toggleVisibility = () => {
  setIsVisible(!isVisible);
};

type FilterMenuProps = {
  filter: string;
  setFilter: (e: string) => void;
  searchQuery: string;
  setSearchQuery: (e: string) => void;
  isMenuOpen: boolean;
  closeMenu: () => void;
  placeholder: string;
};
function FilterMenu({
  filter,
  setFilter,
  closeMenu,
  searchQuery,
  setSearchQuery,
  isMenuOpen,
  placeholder,
}: FilterMenuProps) {
  return (
    isMenuOpen && (
      <div className="overlay">
        <div className="overlay-backdrop" onClick={() => closeMenu()}></div>

        <div className="menu-overlay">
          <div className="filter-options">
            <div className="search-bar">
              <input
                type="search"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setFilter("all")}
              disabled={filter === "all"}
            >
              <FontAwesomeIcon icon={faBook} className="icon" /> Alle
            </button>
            <button
              onClick={() => setFilter("today")}
              disabled={filter === "today"}
            >
              <FontAwesomeIcon icon={faCalendarDay} className="icon" /> Heute
            </button>
            <button
              onClick={() => setFilter("tomorrow")}
              disabled={filter === "tomorrow"}
            >
              <FontAwesomeIcon icon={faCalendarDay} className="icon" /> Bis
              morgen
            </button>
            <button
              onClick={() => setFilter("week")}
              disabled={filter === "week"}
            >
              <FontAwesomeIcon icon={faCalendarWeek} className="icon" /> Diese
              Woche
            </button>
            <button
              onClick={() => setFilter("nextWeek")}
              disabled={filter === "nextWeek"}
            >
              <FontAwesomeIcon icon={faCalendarWeek} className="icon" /> Nächste
              Woche
            </button>
            <button
              onClick={() => setFilter("important")}
              disabled={filter === "important"}
            >
              <FontAwesomeIcon icon={faExclamation} className="icon" /> Wichtig
            </button>
            <button
              onClick={() => setFilter("done")}
              disabled={filter === "done"}
            >
              <FontAwesomeIcon icon={faCheckCircle} className="icon" /> Erledigt
            </button>
            <button
              onClick={() => setFilter("missed")}
              disabled={filter === "missed"}
            >
              <FontAwesomeIcon icon={faTimesCircle} className="icon" /> Verpasst
            </button>
            <button
              onClick={() => setFilter("noDeadline")}
              disabled={filter === "noDeadline"}
            >
              <FontAwesomeIcon icon={faInfinity} className="icon" />
              Ohne Deadline
            </button>
            <button
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
              disabled={filter === "all" && searchQuery === ""}
            >
              <FontAwesomeIcon icon={faFilter} className="icon" />
              Filter entfernen
            </button>
          </div>
        </div>
      </div>
    )
  );
}
export default FilterMenu;
