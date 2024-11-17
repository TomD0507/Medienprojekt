import { useEffect, useState } from "react";
import Overlay from "./components/Overlay";

function App() {
  const [isOpen, setOverlay] = useState(false);

  const closeOverlay = () => setOverlay(false);

  useEffect( () => {
    fetch('http://localhost:5000/api', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log('Hello World!', data)
    })
    .catch( error => {
      console.error(error)
    })
  }, [])

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
