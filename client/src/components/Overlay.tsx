// import React from "react";
import { useEffect } from "react";
import "../styles/Overlay.css";
//
interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

function Overlay({ isOpen, onClose, children }: OverlayProps) {
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);
  if (!isOpen) return null; // Nur wenn geöffnet rendern

  return (
    <div className="overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="overlay-content">
        <button className="overlay-close" onClick={onClose}>
          <span className="x"></span>
        </button>

        {children}
      </div>
    </div>
  );
}

export default Overlay;
