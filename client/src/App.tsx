import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faRightFromBracket,
  faSortAmountDown,
} from "@fortawesome/free-solid-svg-icons";

import "./styles/Overlay.css";
import {
  getTasksFromArray,
  TaskInput,
  SubtaskInput,
} from "./helpers/taskHelper";

import AddTask from "./components/AddTask";
import { TaskProps } from "./components/Task";
import { Header } from "./components/Header";
import "./index.css";
import "./styles/FilterMenu.css";
import { CollList } from "./components/CollList";
import TaskList from "./components/TaskList";
import axios from "axios";
import FilterMenu, { filterOptions } from "./components/FilterMenu";

import Dialogue from "./taskville-components/Dialogue"; 
import AvatarCustomization from "./taskville-components/AvatarCustomization";
import "./styles/TaskVille/AvatarCustomization.css";

export const API_URL = "https://tesdo.uber.space/api"; // auf was die url vom backend dann ist
// export const API_URL = "http://localhost:5000"; // wenn local( auf computer)

// Const for UserID, TODO: Update to var and updated when logged in

type AppProps = {
  userID: number;
  displayName: string;
  onLogout: () => void;
};
function sortTasks(
  tasks: TaskProps[],
  criteria: "deadline" | "added",
  reverse: boolean = false
): TaskProps[] {
  let sortedTasks;
  if (criteria === "deadline") {
    sortedTasks = [...tasks].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  } else if (criteria === "added") {
    sortedTasks = [...tasks]; // Standardreihenfolge beibehalten
  } else {
    sortedTasks = tasks;
  }

  // Wenn reverse true ist, kehre die Reihenfolge um
  return reverse ? sortedTasks.reverse() : sortedTasks;
}

function App({ userID, onLogout }: AppProps) {
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

  // filter für closed task
  const [closedFilter, setClosedFilter] = useState("all");

  const [isSearchClosedOpen, setIsSearchClosedOpen] = useState(false);
  function closeClosedOptions() {
    setIsSearchClosedOpen(false);
  }
  const [searchClosedQuery, setSearchClosedQuery] = useState("");

  // filter für open task
  const [openFilter, setOpenFilter] = useState("all");

  const [isSearchOpenOpen, setIsSearchOpenOpen] = useState(false);
  function closeOpenOptions() {
    setIsSearchOpenOpen(false);
  }
  const [searchOpenQuery, setSearchOpenQuery] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen || isMenuOpen || isSearchOpenOpen || isSearchClosedOpen) {
      // Scrollen verhindern
      document.body.style.overflow = "hidden";
    } else {
      // Scrollen erlauben
      document.body.style.overflow = "";
    }

    // Cleanup-Funktion: Scrollen wieder aktivieren, falls Overlay entfernt wird
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMenuOpen, isSearchOpenOpen, isSearchClosedOpen]);
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  function handleFilterOpen(task: TaskProps) {
    return filterByPredicates(
      task,
      openFilter,
      searchOpenQuery.trim().toLowerCase()
    );
  }
  function handleFilterClosed(task: TaskProps) {
    return filterByPredicates(
      task,
      closedFilter,
      searchClosedQuery.trim().toLowerCase()
    );
  }
  function filterByPredicates(
    task: TaskProps,
    filter: string,
    searchQuery: string
  ) {
    const today = new Date();
    if (searchQuery.trim() != "") {
      if (
        !(
          task.title.toLowerCase().includes(searchQuery) || // Search in title
          (task.description &&
            task.description.toLowerCase().includes(searchQuery)) ||
          (task.subtasks &&
            task.subtasks.some((element) =>
              element.name.toLowerCase().includes(searchQuery)
            ))
        )
      ) {
        return false;
      }
    }
    const filterOption = filterOptions.find((option) => option.key === filter);
    if (!filterOption) {
      return false; // Fallback: Zeige alle Tasks
    }
    return filterOption.condition(task, today);
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

  const [sortArg, setSortArg] = useState("deadline");
  function handleSortTasks(tasks: TaskProps[]): TaskProps[] {
    if (sortArg === "added") {
      return sortTasks(tasks, "added", true); // Umgekehrte Reihenfolge für "added"
    } else {
      return sortTasks(tasks, "deadline", false); // Normale Reihenfolge für "deadline"
    }
  }

  const headAssets = [
    { path: "/src/assets/Taskville/head-testZagreus.png", title: "headZagreus"},
    { path: "/src/assets/Taskville/head-testMelinoe.png", title: "headMelinoe"},
    { path: "/src/assets/Taskville/head-testPrometheus.png", title: "headPrometheus"},
    { path: "/src/assets/Taskville/head-testHades.png", title: "headHades"}
  ];

  const bodyAssets = [
    { path: "/src/assets/Taskville/body-testSpongebob.png", title: "bodySpongebob"},
    { path: "/src/assets/Taskville/body-testSquidward.png", title: "bodySquidward"},
    { path: "/src/assets/Taskville/body-testKrabs.png", title: "bodyKrabs"},
    { path: "/src/assets/Taskville/body-testPlankton.png", title: "bodyPlankton"}
  ];

  const legAssets = [
    { path: "/src/assets/Taskville/leg-testAragorn.png", title: "legAragorn"},
    { path: "/src/assets/Taskville/leg-testLegolas.png", title: "legLegolas"},
    { path: "/src/assets/Taskville/leg-testGimmli.png", title: "legGimmli"},
    { path: "/src/assets/Taskville/leg-testGandalf.png", title: "legGandalf"}
  ];
  
  const isTesting = false;

  return (
    <div className="app">
      {/* Header */}
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onSearchToggle={
          "open" === selectedTaskTab
            ? () => setIsSearchOpenOpen(true)
            : () => setIsSearchClosedOpen(true)
        }
        deleteSearchQuery={
          "done" === selectedTaskTab
            ? () => setSearchClosedQuery("")
            : () => setSearchOpenQuery("")
        }
        delteFilter={
          "done" === selectedTaskTab
            ? () => setClosedFilter("all")
            : () => setOpenFilter("all")
        }
        filter={"done" === selectedTaskTab ? closedFilter : openFilter}
        searchQuery={
          "done" === selectedTaskTab ? searchClosedQuery : searchOpenQuery
        }
        title={"done" === selectedTaskTab ? "Erledigte ToDos" : "Offene ToDos"}
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
              tasks={handleSortTasks(
                doneTasks
                  .filter((task) => !task.deleted)

                  .filter(handleFilterClosed)
              )}
              onUpdateTask={handleUpdateTask}
            />
          </CollList>
          <CollList visible={"open" === selectedTaskTab}>
            <TaskList
              currentTime={currentTime}
              tasks={handleSortTasks(
                openTasks
                  .filter((task) => !task.deleted)

                  .filter(handleFilterOpen)
              )}
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
      <button className="add-task-button" onClick={() => setOverlay(true)}>
        Aufgabe hinzufügen
      </button>
      {isTesting && 
        <div>
          <Dialogue></Dialogue>
        </div>
      }
      {isTesting && 
        <div className="sliderContainer">
          <AvatarCustomization assets={headAssets}></AvatarCustomization>
          <AvatarCustomization assets={bodyAssets}></AvatarCustomization>
          <AvatarCustomization assets={legAssets}></AvatarCustomization>
        </div>
      }
      {/* burgerMenu */}
      {isMenuOpen && (
        <div className="overlay">
          <div
            className="overlay-backdrop"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          ></div>
          <div ref={menuRef} className="menu-overlay">
            <div className="app-options">
              {/* Überschrift für Sortier-Buttons */}
              <div>
                <h3 className="sort-title">Sortieren</h3>

                {/* Sortier-Buttons */}
                <div className="sort-buttons">
                  <button
                    onClick={() => setSortArg("deadline")}
                    disabled={sortArg === "deadline"}
                    className="text_leftbound"
                  >
                    <FontAwesomeIcon icon={faClock} className="icon" />
                    {"Nächste Deadline"}
                  </button>
                  <button
                    onClick={() => setSortArg("added")}
                    disabled={sortArg === "added"}
                    className="text_leftbound"
                  >
                    <FontAwesomeIcon icon={faSortAmountDown} className="icon" />
                    Zuletzt hinzugefügt
                  </button>
                </div>
              </div>
              <div>
                {/* Trennlinie */}
                <hr className="divider" />

                {/* Logout-Button */}
                <button
                  className="logout"
                  onClick={() => {
                    onLogout();
                  }}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="icon" />
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Searchmenus */}
      <FilterMenu
        filter={openFilter}
        setFilter={setOpenFilter}
        searchQuery={searchOpenQuery}
        setSearchQuery={setSearchOpenQuery}
        isMenuOpen={isSearchOpenOpen}
        closeMenu={closeOpenOptions}
        placeholder={"Durchsuche deine offenen Aufgaben:"}
      />
      <FilterMenu
        filter={closedFilter}
        setFilter={setClosedFilter}
        searchQuery={searchClosedQuery}
        setSearchQuery={setSearchClosedQuery}
        isMenuOpen={isSearchClosedOpen}
        closeMenu={closeClosedOptions}
        placeholder={"Durchsuche deine erledigten Aufgaben:"}
      />
    </div>
  );
}

export default App;
