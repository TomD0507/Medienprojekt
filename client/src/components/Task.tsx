/* eslint-disable @typescript-eslint/no-unused-vars */
//ein Task element

import React, { useState } from "react";
import "../styles/Task.css";
type Priority = "low" | "medium" | "high"; //prioritätet
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
    <div className="task-element">
      <button className="checkbox" onClick={toggleTaskDone}>
        {taskDone ? "Mark as Not Done" : "Mark as Done"}
      </button>
      <h2>{props.title}</h2>
      <p>{props.description}</p>
      <p>Priority: {props.priority}</p>
      <p>Deadline: {props.deadline.toDateString()}</p>
      <p>Status: {taskStatus}</p>
      <h3>Subtasks</h3>
      <ul>
        {subtasks.map((subtask, index) => (
          <li
            key={subtask.name}
            onClick={() => toggleSubtask(index)}
            className={subtask.done ? "done-task" : "normal-task"}
          >
            {subtask.name} - {subtask.done ? "Done" : "Not Done"}
          </li>
        ))}
      </ul>
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
