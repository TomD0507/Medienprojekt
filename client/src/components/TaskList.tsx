import Task, { TaskProps } from "./Task"; // Import der Task-Komponente
import { Subtask } from "./Task";

// Definiere die Struktur eines Tasks

// TaskList-Komponente
interface TaskListProps {
  tasks: TaskProps[];
  subtasks: Subtask[] | null;
  onUpdateTask: (updatedTask: TaskProps) => void;
}

function TaskList({ tasks, onUpdateTask }: TaskListProps) {
  return (
    <div>
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
