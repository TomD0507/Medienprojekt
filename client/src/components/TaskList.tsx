import Task, { TaskProps } from "./Task"; // Import der Task-Komponente

// Definiere die Struktur eines Tasks

// TaskList-Komponente
interface TaskListProps {
  tasks: TaskProps[];
  currentTime: Date;
  onUpdateTask: (updatedTask: TaskProps) => void;
}

function TaskList({ tasks, currentTime, onUpdateTask }: TaskListProps) {
  return (
    <div>
      {tasks.map((task) => (
        <Task
          currentTime={currentTime}
          key={task.id} // Uniqe Key für jedes Task-Element
          props={task}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </div>
  );
}

export default TaskList;
