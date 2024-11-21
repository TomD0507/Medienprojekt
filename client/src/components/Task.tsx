/* eslint-disable @typescript-eslint/no-unused-vars */
//ein Task element

import React, { useState } from "react";
import "../styles/Task.css";
import EditTask from "./EditTask"; //prioritäten
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

type Priority = "none" | "low" | "medium" | "high";
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
  reminder: string;
  repeat: string;
}
interface TaskElProps {
  props: TaskProps;
  onUpdateTask: (updatedTask: TaskProps) => void;
}
function Task({ props, onUpdateTask }: TaskElProps) {
  const [isEditing, setIsEditing] = useState(false);
  const toggleSubtask = (index: number) => {
    const updatedSubtasks = props.subtasks.map((subtask, i) =>
      i === index ? { ...subtask, done: !subtask.done } : subtask
    );
    setSubtasks(updatedSubtasks);
  };
  const setSubtasks = (updatedSubtasks: Subtask[]) => {
    onUpdateTask({
      id: props.id,
      title: props.title,
      description: props.description,
      subtasks: updatedSubtasks,
      priority: props.priority,
      deadline: props.deadline,
      done: props.done,
      reminder: props.reminder,
      repeat: props.repeat,
    });
  };
  const toggleTaskdone = () => {
    onUpdateTask({
      id: props.id,
      title: props.title,
      description: props.description,
      subtasks: props.subtasks,
      priority: props.priority,
      deadline: props.deadline,
      done: !props.done,
      reminder: props.reminder,
      repeat: props.repeat,
    });
  };

  const handleEditSave = (updatedTask: TaskProps) => {
    onUpdateTask(updatedTask);
    setIsEditing(false); // Close the dialog
  };
  const taskStatus = props.done
    ? "Done"
    : props.deadline <= new Date()
    ? "Overtime"
    : "Still to do";

  return (
    <>
      <div className="task-element">
        <div
          className={props.done ? "grayout" : "no_grayout"}
          onClick={() => setIsEditing(true)}
        ></div>
        <div className="side-by-side">
          <div className="itemleft">
            <button className="checkbox over_grayout" onClick={toggleTaskdone}>
              {props.done ? <span>&#x2713;</span> : " "}
            </button>
          </div>
          <div className="itemmiddle">
            <div className={props.done ? "item done-task" : "item normal-task"}>
              <h2>{props.title}</h2>
              <p className="descriptionbox">{props.description}</p>
              <h3>Subtasks</h3>
            </div>
            <ul>
              {props.subtasks.map((subtask, index) => (
                <li
                  key={subtask.name}
                  //onClick={() => toggleSubtask(index)}
                  className={"subtaskbox side-by-side"}
                >
                  <button
                    className="checkbox"
                    onClick={() => toggleSubtask(index)}
                  >
                    {subtask.done ? <span>&#x2713;</span> : " "}
                  </button>
                  <div className={subtask.done ? "done-task" : "normal-task"}>
                    {subtask.name}
                  </div>
                </li>
              ))}
            </ul>
            <div className="side-by-side">
              <p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-calendar"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                </svg>
                {props.deadline.toDateString()}
              </p>
              <p>Status: {taskStatus}</p>
            </div>
          </div>
          <div className="itemright">
            <span className="priority-display">
              {getPrioritySymbol(props.priority)}
            </span>
          </div>
        </div>
      </div>
      {isEditing && (
        <EditTask
          id={props.id}
          title={props.title}
          description={props.description}
          subtasks={props.subtasks}
          priority={props.priority}
          deadline={`${
            props.deadline.toISOString().split("T")[0]
          } ${props.deadline.toISOString().split("T")[1].slice(0, 5)}`}
          reminder={props.reminder}
          repeat={props.repeat}
          done={props.done}
          onSave={handleEditSave}
          onClose={() => setIsEditing(false)}
          isOpen={isEditing}
        />
      )}
    </>
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
