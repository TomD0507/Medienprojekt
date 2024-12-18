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
  if (!isMenuOpen) return null; // Nur wenn geöffnet rendern
  const [filterButtonShow, setFilterButtonShow] = useState(false);

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
              <div> 
                 {filterButtonShow && <div> <button onClick={()=>{setFilterButtonShow(!filterButtonShow);
                  setFilter("all");setSearchQuery("");}}>X</button>
              </div>}
  
              </div>
            </div>
            <button
              onClick={() => {setFilter("all"); if(filterButtonShow){setFilterButtonShow(!filterButtonShow)}}}
              disabled={filter === "all"}
            >
              <FontAwesomeIcon icon={faBook} className="icon" /> Alle
            </button>
            <button
              onClick={() =>{ setFilter("today");
                setFilterButtonShow(!filterButtonShow);
              }}
              disabled={filter === "today"}
            >
              <FontAwesomeIcon icon={faCalendarDay} className="icon" /> Heute
            </button>
            <button
              onClick={() =>{ setFilter("tomorrow");if(!filterButtonShow){setFilterButtonShow(!filterButtonShow)};
              }}
              
              disabled={filter === "tomorrow"}
            >
              <FontAwesomeIcon icon={faCalendarDay} className="icon" /> Bis
              morgen
            </button>
            <button
              onClick={() =>{ setFilter("week");if(!filterButtonShow){setFilterButtonShow(!filterButtonShow)};
              }}
              disabled={filter === "week"}
            >
              <FontAwesomeIcon icon={faCalendarWeek} className="icon" /> Diese
              Woche
            </button>
            <button
              onClick={() => { setFilter("nextWeek");if(!filterButtonShow){setFilterButtonShow(!filterButtonShow)};
              }}
              disabled={filter === "nextWeek"}
            >
              <FontAwesomeIcon icon={faCalendarWeek} className="icon" /> Nächste
              Woche
            </button>
            <button
              onClick={() => { setFilter("important");if(!filterButtonShow){setFilterButtonShow(!filterButtonShow)};
              }}
              disabled={filter === "important"}
            >
              <FontAwesomeIcon icon={faExclamation} className="icon" /> Wichtig
            </button>
            <button
              onClick={() => { setFilter("done");if(!filterButtonShow){setFilterButtonShow(!filterButtonShow)};
              }}
              disabled={filter === "done"}
            >
              <FontAwesomeIcon icon={faCheckCircle} className="icon" /> Erledigt
            </button>
            <button
              onClick={() => { setFilter("missed");if(!filterButtonShow){setFilterButtonShow(!filterButtonShow)};
              }}
              disabled={filter === "missed"}
            >
              <FontAwesomeIcon icon={faTimesCircle} className="icon" /> Verpasst
            </button>
            <button
              onClick={() => { setFilter("noDeadline");if(!filterButtonShow){setFilterButtonShow(!filterButtonShow)};
              }}
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
              Alle Filter entfernen
            </button>
          </div>
        </div>
      </div>
    )
  );
}
export default FilterMenu;
