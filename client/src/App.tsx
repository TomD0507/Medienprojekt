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
    </div>
  );
}
export default App;
