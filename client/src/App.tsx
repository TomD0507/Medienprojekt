import { useEffect, useRef, useState } from "react";
import Overlay from "./components/Overlay";
import AddTask from "./components/AddTask";
import Task from "./components/Task";
import { Header } from "./components/Header";
import "./index.css";
import { CollList } from "./components/CollList";

function App() {
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
          {/*{isOpen ? (
            <Overlay
              isOpen={isOpen}
              onClose={closeOverlay}
              children={
                <AddTask user={"isOpen"} onClose={closeOverlay}></AddTask>
              }
            ></Overlay>
          ) : null}*/}
          <AddTask
            user={"isOpen"}
            onClose={closeOverlay}
            isOpen={isOpen}
          ></AddTask>
          <Task
            id={"ID"}
            title={"Test-ToDo"}
            description={"Test Description"}
            subtasks={[
              { name: "Write documentation", done: false },
              { name: "Fix bugs", done: true },
              { name: "Prepare presentation", done: false },
              {
                name: "extreme long desc to test wheter it can handle or not, like i mean wheter it goes to next lines and where its buttton goes and stuff",
                done: false,
              },
            ]}
            deadline={new Date()}
            priority={"low"}
            done={false}
          ></Task>
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
