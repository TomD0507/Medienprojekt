import { useEffect, useRef, useState } from "react";
import Overlay from "./components/Overlay";
import AddTask from "./components/AddTask";
import Task from "./components/Task";
import { Header } from "./components/Header";
import "./index.css";
import { CollList } from "./components/CollList";
import TaskList from "./components/TaskList";
const initialTasks = [
  {
    id: "1",
    title: "Task 1",
    description: "Description for Task 1",
    subtasks: [
      { name: "Subtask 1.1", done: false },
      { name: "Subtask 1.2", done: true },
    ],
    deadline: new Date(2024, 11, 25),
    priority: "Hoch" as Priority,
    done: false,
    reminder: "Nie",
    repeat: "Nie",
  },
  {
    id: "2",
    title: "Task 2",
    description: "Description for Task 2",
    subtasks: [
      { name: "Subtask 2.1", done: false },
      { name: "Subtask 2.2", done: false },
    ],
    deadline: new Date(2024, 11, 30),
    priority: "Keine" as Priority,
    done: false,
    reminder: "Täglich",
    repeat: "Nie",
  },
];

type Priority = "none" | "low" | "medium" | "high";
type Subtask = {
  name: string;
  done: boolean;
};
interface TaskProps {
  id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
  deadline: Date;
  priority: Priority;
  done: boolean;
  reminder: string;
  repeat: string;
}
function App() {
  const [tasks, setTasks] = useState(initialTasks);

  const handleUpdateTask = (updatedTask: TaskProps) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const [isOpen, setOverlay] = useState(false);
  const closeOverlay = () => setOverlay(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    fetch("http://localhost:5000/api", {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log("Hello World!", data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
      />

      {/* Home Screen */}
      <main>
        <header>Aufgaben</header>
        <CollList title="Offene ToDos">
          <AddTask
            user={"isOpen"}
            onClose={closeOverlay}
            isOpen={isOpen}
          ></AddTask>

          <TaskList tasks={tasks} onUpdateTask={handleUpdateTask} />
          <button onClick={() => setOverlay(true)}>Open overlay</button>
        </CollList>
        <CollList title="Erledigte Aufgaben">
          <p>Leer</p>
        </CollList>
      </main>

      {/* Menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="menu-overlay">
          Menü
        </div>
      )}

      {/* Searchbar */}
      {isSearchOpen && (
        <div ref={searchBarRef} className="search-bar">
          <input type="text" placeholder="Nach Keywords suchen.." />
        </div>
      )}
    </div>
  );
}

export default App;
