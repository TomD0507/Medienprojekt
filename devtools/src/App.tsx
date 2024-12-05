import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { SubtaskInput, TaskInput } from "./helpers/taskHelper";

export const API_URL = "https://tesdo.uber.space/api"; // auf was die url vom backend dann ist
// export const API_URL = "http://localhost:5000"; // wenn local( auf computer)

// Const for UserID, TODO: Update to var and updated when logged in

type AppProps = {
  userID: number;
  displayName: string;
};

function App({ userID }: AppProps) {
  // Initialization call to the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, subtasksResponse] = await Promise.all([
          axios.get(`${API_URL}/read-tasks`, { params: { id: userID } }),
          axios.get(`${API_URL}/read-subtasks`, { params: { id: userID } }),
        ]);

        const tasksArray: TaskInput[] = tasksResponse.data;
        const subtasksArray: SubtaskInput[] = subtasksResponse.data;
      } catch (error) {
        console.error("Error fetching tasks or subtasks:", error);
      }
    };

    fetchData();
  }, []);

  return <div className="app"></div>;
}

export default App;
