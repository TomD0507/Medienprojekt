import { Priority, TaskProps, Subtask } from "../components/Task";

//** Helper interfaces for database-arrays */ 
export interface TaskInput {
  todoId: number;
  description: string;
  title: string;
  deadline: Date;
  priority: "none" | "low" | "medium" | "high";
  isDone: boolean;
  todoReminder: "Nie" | "Täglich" | "Wöchentlich" | "Monatlich";
  todoRepeat: "Nie" | "Täglich" | "Wöchentlich" | "Monatlich";
  todoDeleted: boolean;
}

//** Helper interfaces for database-arrays */ 
export interface SubtaskInput {
  mainTaskId: number;
  name: string;
  isDone: boolean;
}
  
/** Helper functions for getting TasksProps[] from the backend-call */ 
export const getTasksFromArray = (
  taskArray: TaskInput[],
  subtaskArray: SubtaskInput[]
): TaskProps[] => {
  const allTasks: TaskProps[] = [];
  for (const task of taskArray) {
    const loadedTask: TaskProps = {
      id: task.todoId,
      subtasks: getSubtasksFromArray(subtaskArray, task.todoId),
      description: task.description,
      title: task.title,
      deadline: task.deadline ? new Date(task.deadline) : new Date(""),
      priority: task.priority as Priority,
      done: task.isDone,
      reminder: task.todoReminder,
      repeat: task.todoRepeat,
      deleted: task.todoDeleted,
    };
    allTasks.push(loadedTask);
  }
  return allTasks;
};


/** Helper functions for getting Subtasks[] from the backend-call */
const getSubtasksFromArray = (
  subtaskArray: SubtaskInput[],
  mainTaskId: number
) => {
  const allSubtasks: Subtask[] = [];
  for (const subtask of subtaskArray) {
    if (subtask.mainTaskId == mainTaskId) {
      const loadedSubtask: Subtask = {
        name: subtask.name,
        done: subtask.isDone,
      };
      allSubtasks.push(loadedSubtask);
    }
  }
  return allSubtasks;
};
