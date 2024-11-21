/* eslint-disable @typescript-eslint/no-unused-vars */
//ein Task element

import { useState } from "react";
import "../styles/Task.css";
import EditTask from "./EditTask"; //prioritäten
const getPrioritySymbol = (priority: Priority) => {
  switch (priority) {
    case "none":
      return " "; // Kein Symbol
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
export function isValidDate(date: Date) {
  // Check if the input is a valid Date object
  return date instanceof Date && !isNaN(date.getTime());
}
export type Priority = "none" | "low" | "medium" | "high";
export type Subtask = {
  name: string;
  done: boolean;
};

//argumente, die ein taskelement haben kann
export interface TaskProps {
  id: number;
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

  function formatDate(date: Date) {
    if (!isValidDate(date)) {
      return "Ungültiges Datum"; // "Invalid date" in German
    }

    const now = new Date();
    const timeDifference = now.getTime() - date.getTime(); // Difference in milliseconds

    // Check if the date is today
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      timeDifference >= 24 * 60 * 60 * 1000 &&
      timeDifference < 2 * 24 * 60 * 60 * 1000;

    // If it's today, show the time (e.g., "12:30")
    if (isToday) {
      return `Heute um ${date.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // If it's yesterday, show "Yesterday"
    if (isYesterday) {
      return `Gestern um ${date.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // If it's within the last 7 days, show relative date (e.g., "20. Nov.")
    if (timeDifference < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString("de-DE", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    // For older dates, show a more detailed format (e.g., "20. November 2024, 12:30")
    return date.toLocaleString("de-DE", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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
            {isValidDate(props.deadline) && (
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
                  {formatDate(props.deadline)}
                </p>
                <p>Status: {taskStatus}</p>
              </div>
            )}
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
          deadline={props.deadline}
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
