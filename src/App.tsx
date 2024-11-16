import React, { useState } from "react";
import Overlay from "./components/Overlay";

function App() {
  const [isOpen, setOverlay] = useState(false);

  const closeOverlay = () => setOverlay(false);



  return (
    <div>
      {isOpen ? (
        <Overlay
          isOpen={isOpen}
          onClose={closeOverlay}
        >
        </Overlay>
      ) : null}

      <button onClick={() => setOverlay(true)}>Open overlay</button>
    </div>
  );
}
export default App;
