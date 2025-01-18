import React from "react";
import "../styles/SwapHeader.css";

type SwapHeaderProps = {
  firstChild: React.ReactNode; // First child component
  secondChild: React.ReactNode; // Second child component
  onMenuToggle: () => void; // Callback for menu toggle button
  showSecondChild: boolean;
  setShowSecondChild: (arg: boolean) => void;
};

export const SwapHeader: React.FC<SwapHeaderProps> = ({
  firstChild,
  secondChild,
  onMenuToggle,
  showSecondChild,
  setShowSecondChild,
}) => {
  return (
    <div className="swap-header">
      {showSecondChild && (
        <button className="menu-button" onClick={onMenuToggle}>
          ☰
        </button>
      )}
      <div className="child-container">
        {showSecondChild ? (
          <button
            className="menu-button"
            onClick={() => setShowSecondChild(false)}
          >
            Show
          </button>
        ) : (
          firstChild
        )}
      </div>
      <div className="child-container">
        {showSecondChild ? (
          secondChild
        ) : (
          <button
            className="menu-button"
            onClick={() => setShowSecondChild(true)}
          >
            ☰
          </button>
        )}
      </div>
    </div>
  );
};
