import React, { useState } from "react";
import Register from "./components/Register";
import ShowUsers from "./components/ShowUsers";
import ManageRewards from "./components/ManageRewards"; // Import the new component
import "./styles/PageManager.css"; // Import the CSS file
import BlockUsers from "./components/BlockUsers";

function PageManager() {
  // State to manage the current view
  const [currentView, setCurrentView] = useState("register");

  return (
    <>
      {/* Header with buttons for navigation */}
      <header className="header">
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
        <button
          className={currentView === "manageRewards" ? "active" : ""}
          onClick={() => setCurrentView("manageRewards")}
          disabled={currentView === "manageRewards"}
        >
          Manage Rewards
        </button>
        <button
          className={currentView === "blockUsers" ? "active" : ""}
          onClick={() => setCurrentView("blockUsers")}
          disabled={currentView === "blockUsers"}
        >
          Block user
        </button>
      </header>
      {currentView === "register" && <Register />}
      {currentView === "showUsers" && <ShowUsers />}
      {currentView === "manageRewards" && <ManageRewards />}
      {currentView === "blockUsers" && <BlockUsers />}
    </>
  );
}

export default PageManager;
