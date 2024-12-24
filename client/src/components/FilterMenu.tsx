import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";
import { faInfinity } from "@fortawesome/free-solid-svg-icons/faInfinity";
import {
  faBook,
  faCalendarDay,
  faCalendarWeek,
  faCheckCircle,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isValidDate } from "./Task";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type FilterMenuProps = {
  filter: string;
  setFilter: (e: string) => void;
  searchQuery: string;
  setSearchQuery: (e: string) => void;
  isMenuOpen: boolean;
  closeMenu: () => void;
  placeholder: string;
};
export const filterOptions = [
  {
    key: "all",
    text: "Alle",
    icon: faBook,
    condition: () => true, // Show all tasks
  },
  {
    key: "today",
    text: "Heute",
    icon: faCalendarDay,
    condition: (
      task: {
        deadline: Date;
      },
      today: Date
    ) =>
      task.deadline.getDate() === today.getDate() &&
      task.deadline.getMonth() === today.getMonth() &&
      task.deadline.getFullYear() === today.getFullYear(),
  },
  {
    key: "tomorrow",
    text: "Bis morgen",
    icon: faCalendarDay,
    condition: (
      task: {
        deadline: Date;
      },
      today: Date
    ) =>
      task.deadline.getDate() === today.getDate() ||
      (task.deadline.getDate() === today.getDate() + 1 &&
        task.deadline.getMonth() === today.getMonth() &&
        task.deadline.getFullYear() === today.getFullYear()),
  },
  {
    key: "week",
    text: "Diese Woche",
    icon: faCalendarWeek,
    condition: (task: { deadline: Date }, today: Date) => {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const taskDate = new Date(task.deadline);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    },
  },
  {
    key: "nextWeek",
    text: "Nächste Woche",
    icon: faCalendarWeek,
    condition: (task: { deadline: Date }, today: Date) => {
      const startOfNextWeek = new Date(today);
      startOfNextWeek.setDate(today.getDate() - today.getDay() + 8);
      startOfNextWeek.setHours(0, 0, 0, 0);

      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
      endOfNextWeek.setHours(23, 59, 59, 999);

      const taskDate = new Date(task.deadline);
      return taskDate >= startOfNextWeek && taskDate <= endOfNextWeek;
    },
  },
  {
    key: "done",
    text: "Erledigt",
    icon: faCheckCircle,
    condition: (task: { done: boolean }) => task.done,
  },
  {
    key: "missed",
    text: "Verpasst",
    icon: faTimesCircle,
    condition: (task: { done: boolean; deadline: Date }, today: Date) =>
      !task.done && task.deadline <= today,
  },
  {
    key: "noDeadline",
    text: "Ohne Deadline",
    icon: faInfinity,
    condition: (task: { deadline: Date }) => !isValidDate(task.deadline),
  },
  {
    key: "low",
    text: "Niedrige Priorität",
    icon: "🟢",
    condition: (task: { priority: string }) => task.priority === "low",
  },
  {
    key: "medium",
    text: "Mittlere Priorität",
    icon: "🟠",
    condition: (task: { priority: string }) => task.priority === "medium",
  },
  {
    key: "high",
    text: "Hohe Priorität",
    icon: "🔴",
    condition: (task: { priority: string }) => task.priority === "high",
  },
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

            <div className="sort-buttons">
              {filterOptions.map(({ key, text, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  disabled={filter === key}
                  className="text_leftbound"
                >
                  {icon instanceof Object ? (
                    <FontAwesomeIcon
                      icon={icon as IconDefinition}
                      className="icon"
                    />
                  ) : (
                    <div className="icon">{icon}</div>
                  )}
                  {text}
                </button>
              ))}
            </div>

            {/* Trennlinie */}
            <hr className="divider" />
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
