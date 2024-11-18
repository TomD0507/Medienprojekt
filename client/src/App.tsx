import { useEffect, useState } from "react";
import Overlay from "./components/Overlay";
import AddTask from "./components/AddTask";
import Task from "./components/Task";

function App() {
  const [isOpen, setOverlay] = useState(false);

  const closeOverlay = () => setOverlay(false);

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
    <div>
      {isOpen ? (
        <Overlay
          isOpen={isOpen}
          onClose={closeOverlay}
          children={<AddTask user={"isOpen"} onClose={closeOverlay}></AddTask>}
        ></Overlay>
      ) : null}

      <Task
        id={""}
        title={""}
        description={""}
        subtasks={[]}
        deadline={new Date()}
        priority={"low"}
        done={false}
      ></Task>
      <button onClick={() => setOverlay(true)}>Open overlay</button>
    </div>
  );
}
export default App;
