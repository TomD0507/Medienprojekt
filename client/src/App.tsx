/** Frameworks */
import { useEffect, useState } from "react";
import axios from "axios";

/** Helper functions */
import {
  getTasksFromArray,
  TaskInput,
  SubtaskInput,
} from "./helpers/taskHelper";

/** Components */
import { TaskProps } from "./components/Task";
import AddTask from "./components/AddTask";
import { CollList } from "./components/CollList";
import TaskList from "./components/TaskList";
import { filterOptions } from "./components/FilterMenu";

/** Styles */
import "./index.css";
import "./styles/Overlay.css";
import "./styles/FilterMenu.css";
import "./styles/BurgerMenu.css";

export const API_URL = "https://devstate.uber.space/api"; // auf was die URL vom Backend dann ist
// export const API_URL = "http://localhost:5000"; // wenn local (auf Computer)

type AppProps = {
  userID: number;
  name: string;
  password: string;
  isMenuOpen: boolean;
  isSearchOpenOpen: boolean;
  isSearchClosedOpen: boolean;
  mailModal: boolean;
  selectedTaskTab: string;
  setSelectedTaskTab: (arg: string) => void;
  returnHook: (arg: number) => void;
  sortArg: string;
  closedFilter: string;
  searchClosedQuery: string;
  openFilter: string;
  searchOpenQuery: string;
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

function App({
  userID,
  name,
  password,
  isMenuOpen,
  isSearchOpenOpen,
  isSearchClosedOpen,
  mailModal,
  openFilter,
  searchOpenQuery,
  closedFilter,
  searchClosedQuery,
  selectedTaskTab,
  sortArg,
  setSelectedTaskTab,
  returnHook,
}: AppProps) {
  /** State Hooks */
  // Derived states for openTasks and doneTasks
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  const openTasks = tasks.filter((task) => !task.deleted && !task.done);
  const doneTasks = tasks.filter((task) => !task.deleted && task.done);

  const [id, updateID] = useState(1);

  // Function: Backend call to update tasks
  const handleUpdateTask = (updatedTask: TaskProps) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );

    axios
      .post(`${API_URL}/update-task`, { updatedTask, name, password })
      .then((response) => {
        const updatedValue = response.data; // Assuming backend returns a number
        console.log(response.data);
        returnHook(updatedValue); // Feed the returned number into your returnHook function
        console.log(response);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Function: Backend-Call to save a task after creating it
  const handleSaveTask = (newTask: TaskProps) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
    incrementID();
    axios
      .post(`${API_URL}/new-task`, { newTask, name, password })
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
          axios.get(`${API_URL}/read-tasks`, { params: { name, password } }),
          axios.get(`${API_URL}/read-subtasks`, { params: { name, password } }),
        ]);

        const tasksArray: TaskInput[] = tasksResponse.data;
        const subtasksArray: SubtaskInput[] = subtasksResponse.data;

        const initializedTasks = getTasksFromArray(tasksArray, subtasksArray);

        let maxId = 0;
        for (const task of initializedTasks) {
          if (task.id > maxId) maxId = task.id;
        }
        updateID(maxId + 1);

        setTasks(initializedTasks);
      } catch (error) {
        console.error("Error fetching tasks or subtasks:", error);
      }
    };

    fetchData();
  }, [name, password]);

  const incrementID = () => updateID((prevID) => (prevID += 1));

  const [isOpen, setOverlay] = useState(false);
  const closeOverlay = () => setOverlay(false);

  useEffect(() => {
    if (
      isOpen ||
      isMenuOpen ||
      isSearchOpenOpen ||
      isSearchClosedOpen ||
      mailModal
    ) {
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
  }, [isOpen, isMenuOpen, isSearchOpenOpen, isSearchClosedOpen, mailModal]);

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

  function handleSortTasks(tasks: TaskProps[]): TaskProps[] {
    if (sortArg === "added") {
      return sortTasks(tasks, "added", true); // Umgekehrte Reihenfolge für "added"
    } else {
      return sortTasks(tasks, "deadline", false); // Normale Reihenfolge für "deadline"
    }
  }
  return (
    <>
      {/*<div>{currentTime.toString()}</div>*/}
      {/* Home Screen */}
      <main>
        <header>Aufgaben</header>
        <div className="taskbutton_holder">
          <button
            className="taskbutton_left"
            disabled={selectedTaskTab === "open"}
            onClick={() => setSelectedTaskTab("open")}
          >
            {"Offene Aufgaben"}
          </button>
          <button
            className="taskbutton_right"
            disabled={selectedTaskTab === "done"}
            onClick={() => setSelectedTaskTab("done")}
          >
            {"Erledigte Aufgaben"}
          </button>
        </div>
        <div className="collapsible-content  scrollable-container">
          <CollList visible={"done" === selectedTaskTab}>
            <TaskList
              currentTime={currentTime}
              tasks={handleSortTasks(doneTasks.filter(handleFilterClosed))}
              onUpdateTask={handleUpdateTask}
            />
          </CollList>
          <CollList visible={"open" === selectedTaskTab}>
            <TaskList
              currentTime={currentTime}
              tasks={handleSortTasks(openTasks.filter(handleFilterOpen))}
              onUpdateTask={handleUpdateTask}
            />
          </CollList>
        </div>
      </main>
      <button className="add-task-button" onClick={() => setOverlay(true)}>
        Aufgabe hinzufügen
      </button>
      <AddTask
        id={id}
        onClose={closeOverlay}
        isOpen={isOpen}
        onSave={handleSaveTask}
      ></AddTask>
    </>
  );
}

export default App;
