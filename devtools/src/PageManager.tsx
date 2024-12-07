import React, { useState } from "react";
import Register from "./components/Register";
import ShowUsers from "./components/ShowUsers";
import "./styles/PageManager.css"; // Import the CSS file

function PageManager() {
  // State to manage the current view
  const [currentView, setCurrentView] = useState("register");

  return (
    <>
      {/* Header with buttons for navigation */}
      <header className="header">
        {" "}
        <button
          className={currentView === "register" ? "active" : ""}
          onClick={() => setCurrentView("register")}
          disabled={currentView === "register"}
        >
          Register
        </button>
        <button
          className={currentView === "showUsers" ? "active" : ""}
          onClick={() => setCurrentView("showUsers")}
          disabled={currentView === "showUsers"}
        >
          Show Users
        </button>
      </header>
      {currentView === "register" && <Register />}
      {currentView === "showUsers" && <ShowUsers />}
    </>
  );
}

export default PageManager;
