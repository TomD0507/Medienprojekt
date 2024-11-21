import React from "react";
import Task from "./Task"; // Import der Task-Komponente

type Priority = "none" | "low" | "medium" | "high";
// Definiere die Struktur eines Tasks
type TaskProps = {
  id: string;
  title: string;
  description: string;
  subtasks: { name: string; done: boolean }[];
  deadline: Date;
  priority: Priority;
  done: boolean;
  reminder: string;
  repeat: string;
};

// TaskList-Komponente
interface TaskListProps {
  tasks: TaskProps[];
  onUpdateTask: (updatedTask: TaskProps) => void;
}

function TaskList({ tasks, onUpdateTask }: TaskListProps) {
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <Task
          key={task.id} // Uniqe Key für jedes Task-Element
          props={task}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </div>
  );
}

export default TaskList;
