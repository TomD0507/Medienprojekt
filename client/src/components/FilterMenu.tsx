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
  visible: boolean;
  children: React.ReactNode;
  filter: string;
  setFilter: (e: string) => void;
  searchQuery: string;
  setSearchQuery: (e: string) => void;
  isMenuOpen: boolean;
  closeMenu: () => void;
};
function FilterMenu({
  filter,
  setFilter,
  closeMenu,
  searchQuery,
  setSearchQuery,
}: FilterMenuProps) {
  return (
    <>
      <div className="overlay-backdrop" onClick={() => closeMenu()}></div>
      <div className="menu-overlay">
        <div className="filter-options">
          <button onClick={() => setFilter("all")} disabled={filter === "all"}>
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
            <FontAwesomeIcon icon={faCalendarDay} className="icon" /> Bis morgen
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
    </>
  );
}
export default FilterMenu;
