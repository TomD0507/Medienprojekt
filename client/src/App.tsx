/** Frameworks */
import { useEffect, useRef, useState } from "react";
import axios from "axios";

/** Fonts */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAt, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

/** Helper functions */
import {
  getTasksFromArray,
  TaskInput,
  SubtaskInput,
} from "./helpers/taskHelper";

/** Components */
import { TaskProps } from "./components/Task";
import { Header } from "./components/Header";
import AddTask from "./components/AddTask";
import { CollList } from "./components/CollList";
import TaskList from "./components/TaskList";
import Dialogue from "./taskville-components/Dialogue";
import FilterMenu, { filterOptions } from "./components/FilterMenu";
// import MailModal from "./components/MailModal";
import TaskvilleAvatars from "./taskville-components/TaskvilleAvatars";

/** Styles */
import "./index.css";
import "./styles/Overlay.css";
import "./styles/FilterMenu.css";
import "./styles/BurgerMenu.css";

import AvatarCustomization from "./taskville-components/AvatarCustomization";
import "./styles/TaskVille/AvatarCustomization.css";
import "./styles/TaskVille/TaskvilleAvatars.css";
import MailModal from "./components/MailModal";

export const API_URL = "https://devstate.uber.space/api"; // auf was die URL vom Backend dann ist
// export const API_URL = "http://localhost:5000"; // wenn local (auf Computer)

type AppProps = {
  userID: number;
  displayName: string;
  isMenuOpen: boolean;
  isSearchOpenOpen: boolean;
  isSearchClosedOpen: boolean;
  mailModal: boolean;
  selectedTaskTab: string;
  setSelectedTaskTab: (arg: string) => void;
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
}: AppProps) {
  /** State Hooks */
  const [openTasks, setOpenTasks] = useState<TaskProps[]>([]);
  const [doneTasks, setDoneTasks] = useState<TaskProps[]>([]);
  const [id, updateID] = useState(1);

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
  // This is a hook to close components when you click outside of them

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

  const headAssets = [
    {
      path: "/src/assets/Taskville/head-testZagreus.png",
      title: "headZagreus",
    },
    {
      path: "/src/assets/Taskville/head-testMelinoe.png",
      title: "headMelinoe",
    },
    {
      path: "/src/assets/Taskville/head-testPrometheus.png",
      title: "headPrometheus",
    },
    { path: "/src/assets/Taskville/head-testHades.png", title: "headHades" },
  ];

  const bodyAssets = [
    {
      path: "/src/assets/Taskville/body-testSpongebob.png",
      title: "bodySpongebob",
    },
    {
      path: "/src/assets/Taskville/body-testSquidward.png",
      title: "bodySquidward",
    },
    { path: "/src/assets/Taskville/body-testKrabs.png", title: "bodyKrabs" },
    {
      path: "/src/assets/Taskville/body-testPlankton.png",
      title: "bodyPlankton",
    },
  ];

  const legAssets = [
    { path: "/src/assets/Taskville/leg-testAragorn.png", title: "legAragorn" },
    { path: "/src/assets/Taskville/leg-testLegolas.png", title: "legLegolas" },
    { path: "/src/assets/Taskville/leg-testGimmli.png", title: "legGimmli" },
    { path: "/src/assets/Taskville/leg-testGandalf.png", title: "legGandalf" },
  ];

  const isTesting = false;

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
      {isTesting && (
        <div>
          <Dialogue></Dialogue>
        </div>
      )}
      {isTesting && (
        <div className="sliderContainer">
          <AvatarCustomization assets={headAssets}></AvatarCustomization>
          <AvatarCustomization assets={bodyAssets}></AvatarCustomization>
          <AvatarCustomization assets={legAssets}></AvatarCustomization>
        </div>
      )}
      {isTesting && (
        <div className="taskville-container">
          <TaskvilleAvatars userID={1}></TaskvilleAvatars>
        </div>
      )}
    </>
  );
}

export default App;
