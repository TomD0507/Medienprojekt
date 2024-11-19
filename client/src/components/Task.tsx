/* eslint-disable @typescript-eslint/no-unused-vars */
//ein Task element

import React, { useState } from "react";
import "../styles/Task.css";
type Priority = "none" | "low" | "medium" | "high"; //prioritäten
const getPrioritySymbol = (priority: Priority) => {
  switch (priority) {
    case "none":
      return "⏺️"; // Kein Symbol
    case "low":
      return "🟢"; // Grünes Symbol für niedrige Priorität
    case "medium":
      return "🟠"; // Oranges Symbol für mittlere Priorität
    case "high":
      return "🔴"; // Rotes Symbol für hohe Priorität
    default:
      return ""; // Falls der Wert unerwartet ist
  }
};

type Subtask = {
  name: string;
  done: boolean;
};

//argumente, die ein taskelement haben kann
interface TaskProps {
  id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
  deadline: Date;
  priority: Priority;
  done: boolean;
  //reminder: keine ahnung wie ich den darstelle/welcher type
}
function Task(props: TaskProps) {
  const [taskDone, setTaskDone] = useState(props.done);
  const toggleTaskDone = () => setTaskDone(!taskDone);
  const [subtasks, setSubtasks] = useState(props.subtasks);
  const toggleSubtask = (index: number) => {
    const updatedSubtasks = subtasks.map((subtask, i) =>
      i === index ? { ...subtask, done: !subtask.done } : subtask
    );
    setSubtasks(updatedSubtasks);
  };

  const taskStatus = taskDone
    ? "Done"
    : props.deadline <= new Date()
    ? "Overtime"
    : "Still to do";

  return (
    <div className="task-element side-by-side">
      <div className="item">
        <button className="checkbox" onClick={toggleTaskDone}>
          {taskDone ? <span>&#x2713;</span> : " "}
        </button>
      </div>
      <div className={taskDone ? "item done-task" : "item normal-task"}>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
        <h3>Subtasks</h3>
        <ul>
          {subtasks.map((subtask, index) => (
            <li
              key={subtask.name}
              //onClick={() => toggleSubtask(index)}
              className={"subtaskbox side-by-side"}
            >
              <button className="checkbox" onClick={() => toggleSubtask(index)}>
                {subtask.done ? <span>&#x2713;</span> : ""}
              </button>
              <div className={subtask.done ? "done-task" : "normal-task"}>
                {subtask.name}
              </div>
            </li>
          ))}
        </ul>
        <div className="side-by-side">
          <p>Deadline: {props.deadline.toDateString()}</p>
          <p>Status: {taskStatus}</p>
        </div>
      </div>
      <div className="item">
        <span className="priority-display">
          {getPrioritySymbol(props.priority)}
        </span>
      </div>
    </div>
  );
}
export default Task;
/*
const TaskList = ({ subtasks }) => {
  const [taskState, setTaskState] = useState(subtasks);

  const toggleTask = (index) => {
    const updatedTasks = taskState.map((task, i) =>
      i === index ? { ...task, done: !task.done } : task
    );
    setTaskState(updatedTasks);
  };

  return (
    <ul>
      {taskState.map((item, index) => (
        <li
          key={item.name}
          onClick={() => toggleTask(index)}
          className={item.done ? "done-task" : "normal-task"}
        >
          {item.name} - {item.done ? "Done" : "Not Done"}
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
*/
