import React from "react";
import "../styles/Overlay.css";
import AddTask from "./AddTask";
//
interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function Overlay({ isOpen, onClose }:OverlayProps) {
  if (!isOpen) return null; // Nur wenn geöffnet rendern

  return (
    <div className="overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="overlay-content">
        <button className="overlay-close" onClick={onClose}>
          ×
        </button>
        <AddTask
          user={"isOpen"}
          onClose={onClose}></AddTask>
      </div>
    </div>
  );
};

export default Overlay;
