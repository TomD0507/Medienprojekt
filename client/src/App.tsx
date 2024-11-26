import { useEffect, useRef, useState } from "react";
import AddTask from "./components/AddTask";
import { Priority, TaskProps, Subtask } from "./components/Task";
import { Header } from "./components/Header";
import "./index.css";
import { CollList } from "./components/CollList";
import TaskList from "./components/TaskList";
import axios from "axios";

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
  {
    id: 3,
    title: "Done Task 1",
    description: "Description for Task 1",
    subtasks: [
      { name: "Subtask 1.1", done: false },
      { name: "Subtask 1.2", done: true },
    ],
    deadline: new Date(2024, 11, 25),
    priority: "Hoch" as Priority,
    done: true,
    reminder: "Nie",
    repeat: "Nie",
    deleted: false,
  },
  {
    id: 4,
    title: "Task 4",
    description: "Description for Task 1",
    subtasks: [
      { name: "Subtask 1.1", done: false },
      { name: "Subtask 1.2", done: true },
    ],
    deadline: new Date(2024, 10, 25),
    priority: "Hoch" as Priority,
    done: false,
    reminder: "Nie",
    repeat: "Nie",
    deleted: false,
  },
  {
    id: 5,
    title: "Task 5",
    description: "Description for Task 2",
    subtasks: [
      { name: "Subtask 2.1", done: false },
      { name: "Subtask 2.2", done: false },
    ],
    deadline: new Date(2024, 10, 30),
    priority: "Keine" as Priority,
    done: false,
    reminder: "Täglich",
    repeat: "Nie",
    deleted: false,
  },
];

// Const for UserID, TODO: Update to var and updated when logged in
const userId = 1;

// Helper interfaces for database-arrays
interface TaskInput {
  todoId: number;
  description: string;
  title: string;
  deadline: Date;
  priority: 'none' | 'low' | 'medium' | 'high';
  isDone: boolean;
  todoReminder: 'Nie' | 'Täglich' | 'Wöchentlich' | 'Monatlich';
  todoRepeat: 'Nie' | 'Täglich' | 'Wöchentlich' | 'Monatlich';
  todoDeleted: boolean;
}

interface SubtaskInput {
  mainTaskId: number;
  name: string;
  isDone: boolean;
}

// Helper functions for getting TasksProps[] from the backend-call
const getTasksFromArray = (taskArray: TaskInput[], subtaskArray: SubtaskInput[]): TaskProps[] => {
  const allTasks: TaskProps[] = [];
  for (const task of taskArray) {
    const loadedTask: TaskProps = {
      id: task.todoId,
      subtasks: getSubtasksFromArray(subtaskArray, task.todoId),
      description: task.description,
      title: task.title,
      deadline: task.deadline,
      priority: task.priority as Priority,
      done: task.isDone,
      reminder: task.todoReminder,
      repeat: task.todoRepeat,
      deleted: task.todoDeleted,
    }
    allTasks.push(loadedTask);
  }
  return allTasks;
}

const getSubtasksFromArray = (subtaskArray: SubtaskInput[], mainTaskId: number) => {
  const allSubtasks: Subtask[] = [];
  for (const subtask of subtaskArray) {
    if (subtask.mainTaskId == mainTaskId) {
      const loadedSubtask: Subtask = {
        name: subtask.name,
        done: subtask.isDone
      }
      allSubtasks.push(loadedSubtask)
    }
  }
  return allSubtasks
}

function App() {
  //TODO: replace with proper task save and handling)
  //todo: save user id for backendcalls
  const [openTasks, setOpenTasks] = useState(
    initialTasks.filter((task) => !task.deleted && !task.done)
  );
  const [doneTasks, setDoneTasks] = useState(
    initialTasks.filter((task) => !task.deleted && task.done)
  );
  // This is for the backendcall
  const [subtasks, setSubtasks] = useState(null);
  const [todos, setTodos] = useState<TaskProps[]>([]);


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
      .post('http://localhost:5000/update-task', { updatedTask, userId })
      .then((r) => {
        console.log(r);
      })
      .catch((err) => {
        console.log(err);
      })
  };

  // Function: Backend-Call to save a task after creating it
  const handleSaveTask = (newTask: TaskProps) => {
    // Subtasks sind unique hinsichtlich ihrer "name" Property, also mehrer Subtasks dürfen nicht denselben Namen
    // haben. Bitte noch eine Warnungsmeldung einbauen TODO() 
    setOpenTasks((prevTasks) => [...prevTasks, newTask]);
    incrementID();
    axios
      .post("http://localhost:5000/new-task", { newTask, userId })
      .then((r) => {
        console.log(r);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Function: Backend-Call
  const handleDeleteTask = (deletedTask: TaskProps) => {
    // Hier könnten der frontend-Code stehen TODO()
    axios
      .post("http://localhost:5000/delete-task", { deletedTask, userId })
      .then((r) => {
        console.log(r);
      })
      .catch((err) => {
        console.log(err);
      }); 
  };

  // Initialization call to the backend
  useEffect(()=> {
    const fetchData = async () => {
      // This is how you get the tasks for a specific userId from the db
      const [tasksResponse, subtasksResponse] = await Promise.all([
        axios.get("http://localhost:5000/read-tasks", { params: { id: userId } }),
        axios.get("http://localhost:5000/read-subtasks", { params: { id: userId } }),
      ]);
      const tasksArray: TaskInput[] = tasksResponse.data;
      const subtasksArray: SubtaskInput[] = subtasksResponse.data;
      
      const initalizedTasks = getTasksFromArray(tasksArray, subtasksArray);
      setTodos(initalizedTasks);
      let maxId = 1;
      for (const task of initalizedTasks) {
        if (task.id > maxId) maxId = task.id
      }
      updateID(maxId);
    }
    fetchData();
  }, []);


  const [id, updateID] = useState(initialTasks.length + 1); //TODO: proper way to get taskID(backend counts?)
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

  useEffect(() => {
    fetch("http://localhost:5000/api", {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then(() => {
        console.log("Hello World!");
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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
      const startOfWeek = new Date(today.getDate() - today.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const taskDate = new Date(task.deadline);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    }

    if (filter === "nextWeek") {
      // "Next Week" filter
      const startOfNextWeek = new Date(today.getDate() - today.getDay() + 8);
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
      return task.done === true;
    }
    return false;
  };

  console.log(todos);
  return (
    <div className="app">
      {/* Header */}
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
        filter={filter}
      />

      {/* Home Screen */}
      <main>
        <header>Aufgaben</header>
        <CollList title="Offene ToDos">
          <TaskList
            tasks={openTasks
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
            subtasks={subtasks}
            onUpdateTask={handleUpdateTask}
          />
        </CollList>
        <CollList title="Erledigte Aufgaben">
          <TaskList
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
            subtasks={subtasks}
            onUpdateTask={handleUpdateTask}
          />
        </CollList>
        <AddTask
          id={id}
          onClose={closeOverlay}
          isOpen={isOpen}
          onSave={handleSaveTask}
        ></AddTask>

        <button className="menu-button" onClick={() => setOverlay(true)}>
          Aufgabe hinzufügen
        </button>
      </main>

      {/* Menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="menu-overlay">
          <div className="filter-options">
            <button onClick={() => setFilter("all")}>
              <i className="icon-book"></i> Alle
            </button>
            <button onClick={() => setFilter("today")}>
              <i className="icon-calendar-today"></i> Heute
            </button>
            <button onClick={() => setFilter("tomorrow")}>
              <i className="icon-calendar-today"></i> Morgen
            </button>
            <button onClick={() => setFilter("week")}>
              <i className="icon-calendar-week"></i> Diese Woche
            </button>
            <button onClick={() => setFilter("nextWeek")}>
              <i className="icon-calendar-week"></i> Nächste Woche
            </button>
            <button onClick={() => setFilter("important")}>
              <i className="icon-exclamation"></i> Wichtig
            </button>
            <button onClick={() => setFilter("done")}>
              <i className="icon-check"></i> Erledigt
            </button>
            <button
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
            >
              <i className="icon-book"></i> Filter entfernen
            </button>
          </div>
        </div>
      )}

      {/* Searchbar */}
      {isSearchOpen && (
        <div ref={searchBarRef} className="search-bar">
          <input
            type="text"
            placeholder="Nach Keywords suchen.."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value.trim().toLowerCase())
            }
          />
        </div>
      )}
    </div>
  );
}

export default App;
