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

type FilterMenuProps = {
  filter: string;
  setFilter: (e: string) => void;
  searchQuery: string;
  setSearchQuery: (e: string) => void;
  isMenuOpen: boolean;
  closeMenu: () => void;
  placeholder: string;
};
const filterOptions = [
  { key: "all", text: "Alle", icon: faBook },
  { key: "today", text: "Heute", icon: faCalendarDay },
  { key: "tomorrow", text: "Bis morgen", icon: faCalendarDay },
  { key: "week", text: "Diese Woche", icon: faCalendarWeek },
  { key: "nextWeek", text: "Nächste Woche", icon: faCalendarWeek },
  { key: "important", text: "Wichtig", icon: faExclamation },
  { key: "done", text: "Erledigt", icon: faCheckCircle },
  { key: "missed", text: "Verpasst", icon: faTimesCircle },
  { key: "noDeadline", text: "Ohne Deadline", icon: faInfinity },
];
export function getFilterTextByKey(key: string) {
  const option = filterOptions.find((option) => option.key === key);
  return option ? option.text : "Unbekannt";
}
function FilterMenu({
  filter,
  setFilter,
  closeMenu,
  searchQuery,
  setSearchQuery,
  isMenuOpen,
  placeholder,
}: FilterMenuProps) {
  if (!isMenuOpen) return null; // Nur wenn geöffnet rendern

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
              ></input>
            </div>
            {filterOptions.map(({ key, text, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                disabled={filter === key}
              >
                <FontAwesomeIcon icon={icon} className="icon" /> {text}
              </button>
            ))}
            <button
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
              disabled={filter === "all" && searchQuery === ""}
            >
              <FontAwesomeIcon icon={faFilter} className="icon" />
              Alle Filter entfernen
            </button>
          </div>
        </div>
      </div>
    )
  );
}
export default FilterMenu;
