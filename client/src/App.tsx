import { useEffect, useRef, useState } from "react";
import AddTask from "./components/AddTask";
import { Priority, TaskProps } from "./components/Task";
import { Header } from "./components/Header";
import "./index.css";
import { CollList } from "./components/CollList";
import TaskList from "./components/TaskList";
const initialTasks = [
  {
    id: 1,
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
    deleted: false,
  },
  {
    id: 2,
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
    deleted: false,
  },
];

function App() {
  //TODO: replace with proper task save and handling)
  //todo: save user id for backendcalls
  const [tasks, setTasks] = useState(initialTasks);

  const handleUpdateTask = (updatedTask: TaskProps) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    //backendcall: update(user,updatedTask) maybe zeit eintrag in datenbank für erstellen und löschen
  };
  const handleSaveTask = (newTask: TaskProps) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
    incrementID();
    //backendcall: insert(user,newTask)maybe zeit eintrag in datenbank für erstellen und löschen
  };
  const [id, updateID] = useState(tasks.length + 1); //TODO: proper way to get taskID(backend counts?)
  const incrementID = () => updateID((prevID) => (prevID += 1));

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
            id={id}
            onClose={closeOverlay}
            isOpen={isOpen}
            onSave={handleSaveTask}
          ></AddTask>

          <TaskList
            tasks={tasks.filter((task) => !task.deleted)}
            onUpdateTask={handleUpdateTask}
          />
          <button onClick={() => setOverlay(true)}>Aufgabe hinzufügen</button>
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
