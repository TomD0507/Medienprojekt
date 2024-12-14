import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faCalendarDay,
  faCalendarWeek,
  faExclamation,
  faCheckCircle,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

import "./styles/Overlay.css";
import {
  getTasksFromArray,
  TaskInput,
  SubtaskInput,
} from "./helpers/taskHelper";

import AddTask from "./components/AddTask";
import { isValidDate, TaskProps } from "./components/Task";
import { Header } from "./components/Header";
import "./index.css";
import "./styles/FilterMenu.css";
import { CollList } from "./components/CollList";
import TaskList from "./components/TaskList";
import axios from "axios";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";
import { faInfinity } from "@fortawesome/free-solid-svg-icons/faInfinity";

export const API_URL = "https://tesdo.uber.space/api"; // auf was die url vom backend dann ist
// export const API_URL = "http://localhost:5000"; // wenn local( auf computer)

// Const for UserID, TODO: Update to var and updated when logged in

type AppProps = {
  userID: number;
  displayName: string;
};

function App({ userID }: AppProps) {
  const [openTasks, setOpenTasks] = useState<TaskProps[]>([]);

  const [doneTasks, setDoneTasks] = useState<TaskProps[]>([]);

  // Function: Backend-call to update tasks (either check them as "done/undone" or to alter them)
  const handleUpdateTask = (updatedTask: TaskProps) => {
    setOpenTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setDoneTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    //backendcall: update(user,updatedTask) maybe zeit eintrag in datenbank für erstellen und löschen
    axios
      .post(`${API_URL}/update-task`, { updatedTask, userID })
      .then((r) => {
        console.log(r);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Function: Backend-Call to save a task after creating it
  const handleSaveTask = (newTask: TaskProps) => {
    setOpenTasks((prevTasks) => [...prevTasks, newTask]);
    incrementID();
    axios
      .post(`${API_URL}/new-task`, { newTask, userID })
      .then((r) => {
        console.log(r);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Initialization call to the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, subtasksResponse] = await Promise.all([
          axios.get(`${API_URL}/read-tasks`, { params: { id: userID } }),
          axios.get(`${API_URL}/read-subtasks`, { params: { id: userID } }),
        ]);

        const tasksArray: TaskInput[] = tasksResponse.data;
        const subtasksArray: SubtaskInput[] = subtasksResponse.data;

        const initalizedTasks = getTasksFromArray(tasksArray, subtasksArray);
        let maxId = 0;
        for (const task of initalizedTasks) {
          if (task.id > maxId) maxId = task.id;
        }
        updateID(maxId + 1);

        const [doneTasks, openTasks] = initalizedTasks.reduce<
          [TaskProps[], TaskProps[]]
        >(
          ([done, open], task) => {
            if (!task.deleted) {
              task.done ? done.push(task) : open.push(task);
            }
            return [done, open];
          },
          [[], []]
        );

        setDoneTasks(doneTasks);
        setOpenTasks(openTasks);
      } catch (error) {
        console.error("Error fetching tasks or subtasks:", error);
      }
    };

    fetchData();
  }, [userID]);

  const [id, updateID] = useState(1);
  const incrementID = () => updateID((prevID) => (prevID += 1));

  const [isOpen, setOverlay] = useState(false);
  const closeOverlay = () => setOverlay(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // This is a hook to close components when you click outside of them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        isMenuOpen
      ) {
        setIsMenuOpen(false);
      }

      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node) &&
        isSearchOpen
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isSearchOpen]);

  // filter außerhalb von searchquery
  const [filter, setFilter] = useState("all");

  function filterByPredicates(task: TaskProps) {
    const today = new Date();

    if (filter === "all") {
      return true; // Show all tasks
    }

    if (filter === "today") {
      return (
        task.deadline.getDate() === today.getDate() &&
        task.deadline.getMonth() === today.getMonth() &&
        task.deadline.getFullYear() === today.getFullYear()
      );
    }
    if (filter === "tomorrow") {
      return (
        task.deadline.getDate() === today.getDate() ||
        (task.deadline.getDate() === today.getDate() + 1 &&
          task.deadline.getMonth() === today.getMonth() &&
          task.deadline.getFullYear() === today.getFullYear())
      );
    }
    if (filter === "week") {
      // "This Week" filter

      const startOfWeek = new Date();
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const taskDate = new Date(task.deadline);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    }

    if (filter === "nextWeek") {
      // "Next Week" filter
      const startOfNextWeek = new Date();
      startOfNextWeek.setDate(today.getDate() - today.getDay() + 8);
      startOfNextWeek.setHours(0, 0, 0, 0);

      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
      endOfNextWeek.setHours(23, 59, 59, 999);

      const taskDate = new Date(task.deadline);
      return taskDate >= startOfNextWeek && taskDate <= endOfNextWeek;
    }
    if (filter === "important") {
      return task.priority && task.priority !== "none";
    }
    if (filter === "done") {
      return task.done;
    }
    if (filter === "missed") {
      return !task.done && task.deadline <= currentTime;
    }
    if (filter === "noDeadline") {
      return !isValidDate(task.deadline);
    }
    return false;
  }
  //update current time every 5 seconds
  const [currentTime, updateTime] = useState(new Date());
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTime(new Date());
    }, 5000);
    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);
  const [selectedTaskTab, setSelectedTaskTab] = useState("open");

  return (
    <div className="app">
      {/* Header */}
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
        filter={filter}
      />
      {/*<div>{currentTime.toString()}</div>*/}
      {/* Home Screen */}
      <main>
        <header>Aufgaben</header>
        <div className="taskbutton_holder">
          <button
            className="taskbutton_left"
            onClick={() => setSelectedTaskTab("open")}
          >
            {"Offene ToDos"}
          </button>
          <button
            className="taskbutton_right"
            onClick={() => setSelectedTaskTab("done")}
          >
            {"Erledigte ToDos"}
          </button>
        </div>
        <div>
          <CollList visible={"done" === selectedTaskTab}>
            <TaskList
              currentTime={currentTime}
              tasks={doneTasks
                .filter((task) => !task.deleted)
                .filter(
                  (task) =>
                    task.title.toLowerCase().includes(searchQuery) || // Search in title
                    (task.description &&
                      task.description.toLowerCase().includes(searchQuery)) ||
                    (task.subtasks &&
                      task.subtasks.some((element) =>
                        element.name.toLowerCase().includes(searchQuery)
                      )) // Optionally search in description
                )
                .filter(filterByPredicates)}
              onUpdateTask={handleUpdateTask}
            />
          </CollList>
          <CollList visible={"open" === selectedTaskTab}>
            <TaskList
              currentTime={currentTime}
              tasks={openTasks
                .filter((task) => !task.deleted)
                .filter(
                  (task) =>
                    task.title.toLowerCase().includes(searchQuery) || // Search in title
                    (task.description &&
                      task.description.toLowerCase().includes(searchQuery)) || // search in description
                    (task.subtasks &&
                      task.subtasks.some((element) =>
                        element.name.toLowerCase().includes(searchQuery)
                      )) // search in subtasks
                )
                .filter(filterByPredicates)}
              onUpdateTask={handleUpdateTask}
            />
          </CollList>
        </div>
        <AddTask
          id={id}
          onClose={closeOverlay}
          isOpen={isOpen}
          onSave={handleSaveTask}
        ></AddTask>
      </main>
      <button className="app_header" onClick={() => setOverlay(true)}>
        Aufgabe hinzufügen
      </button>
      {/* Menu */}
      {isMenuOpen && (
        <div className="overlay">
          <div
            className="overlay-backdrop"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          ></div>
          <div ref={menuRef} className="menu-overlay">
            <div className="filter-options">
              <button
                onClick={() => setFilter("all")}
                disabled={filter === "all"}
              >
                <FontAwesomeIcon icon={faBook} /> Alle
              </button>
              <button
                onClick={() => setFilter("today")}
                disabled={filter === "today"}
              >
                <FontAwesomeIcon icon={faCalendarDay} /> Heute
              </button>
              <button
                onClick={() => setFilter("tomorrow")}
                disabled={filter === "tomorrow"}
              >
                <FontAwesomeIcon icon={faCalendarDay} /> Bis morgen
              </button>
              <button
                onClick={() => setFilter("week")}
                disabled={filter === "week"}
              >
                <FontAwesomeIcon icon={faCalendarWeek} /> Diese Woche
              </button>
              <button
                onClick={() => setFilter("nextWeek")}
                disabled={filter === "nextWeek"}
              >
                <FontAwesomeIcon icon={faCalendarWeek} /> Nächste Woche
              </button>
              <button
                onClick={() => setFilter("important")}
                disabled={filter === "important"}
              >
                <FontAwesomeIcon icon={faExclamation} /> Wichtig
              </button>
              <button
                onClick={() => setFilter("done")}
                disabled={filter === "done"}
              >
                <FontAwesomeIcon icon={faCheckCircle} /> Erledigt
              </button>
              <button
                onClick={() => setFilter("missed")}
                disabled={filter === "missed"}
              >
                <FontAwesomeIcon icon={faTimesCircle} /> Verpasst
              </button>
              <button
                onClick={() => setFilter("noDeadline")}
                disabled={filter === "noDeadline"}
              >
                <FontAwesomeIcon icon={faInfinity} /> Ohne Deadline
              </button>
              <button
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
                disabled={filter === "all" && searchQuery === ""}
              >
                <FontAwesomeIcon icon={faFilter} /> Filter entfernen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Searchbar */}
      {isSearchOpen && (
        <div className="overlay">
          <div
            className="overlay-backdrop"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          ></div>
          <div ref={searchBarRef} className="search-bar">
            <input
              type="text"
              placeholder="Nach Keywords suchen..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value.trim().toLowerCase())
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
