import { useState } from "react";
import Overlay from "./Overlay";
import { TaskProps, Priority } from "./Task";

interface AddTaskProps {
  id: number;
  onClose: () => void;
  isOpen: boolean;
  onSave: (task: TaskProps) => void; // Add onSave prop
}

const AddTask = ({ id, onClose, isOpen, onSave }: AddTaskProps) => {
  // State declarations
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([""]);
  const [priority, setPriority] = useState<Priority>("none");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [reminder, setReminder] = useState("Nie");
  const [repeat, setRepeat] = useState("Nie");

  // Methods
  const addSubtask = () => setSubtasks([...subtasks, ""]);
  const updateSubtask = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Bitte einen Titel hinzufügen.");
      return;
    }
    const newTask = {
      id: id,
      title,
      description,
      subtasks: subtasks
        .filter((task) => task.trim() !== "")
        .map((task) => ({ name: task.trim(), done: false })),
      priority,
      deadline: new Date(`${deadlineDate}`),
      reminder,
      repeat,
      done: false,
      deleted: false,
    };
    console.log(newTask.description);
    onSave(newTask); // save funktion
    //form leer machen
    setTitle("");
    setDescription("");
    setSubtasks([""]);
    setPriority("none");
    setDeadlineDate("");
    setReminder("Nie");
    setRepeat("Nie");
    onClose(); // Close the form
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      children={
        <form onSubmit={handleSubmit} className="add-task-form">
          <h3>Aufgabe erstellen</h3>
          {/* Add Task Form Fields */}
          <label>
            Titel:
            <div className="add_item">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titel hinzufügen"
              />
            </div>
          </label>
          <label>
            Beschreibung:
            <div className="add_item">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibung hinzufügen"
              />
            </div>
          </label>
          <label>
            Unteraufgaben:
            {subtasks.map((subtask, index) => (
              <div className="add_item" key={index}>
                <input
                  type="text"
                  value={subtask}
                  onChange={(e) => updateSubtask(index, e.target.value)}
                  placeholder={`Unteraufgabe ${index + 1}`}
                />
                {subtasks.length > 1 && (
                  <button
                    className="deleteSubTaskButton"
                    onClick={(e) => {
                      e.preventDefault();
                      setSubtasks(subtasks.filter((_, i) => i !== index));
                    }}
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
            {subtasks.length < 4 && (
              <button
                className="taskMenuButton"
                type="button"
                onClick={addSubtask}
              >
                + Unteraufgabe hinzufügen
              </button>
            )}
          </label>
          <label>
            Priorität:
            <div className="add_item">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="none">Keine</option>
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
              </select>
            </div>
          </label>
          <label>
            Deadline:
            <div className="add_item">
              <input
                type="datetime-local"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
            </div>
          </label>
          <label>
            Erinnerung hinzufügen:
            <div className="add_item">
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
              >
                <option value="Nie">Nie</option>
                <option value="Täglich">Täglich</option>
                <option value="Wöchentlich">Wöchentlich</option>
                <option value="Monatlich">Monatlich</option>
              </select>
            </div>
          </label>
          <label>
            Wiederholen:
            <div className="add_item">
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
              >
                <option value="Nie">Nie</option>
                <option value="Täglich">Täglich</option>
                <option value="Wöchentlich">Wöchentlich</option>
                <option value="Monatlich">Monatlich</option>
              </select>
            </div>
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="taskMenuAbortButton"
              type="button"
              onClick={onClose}
            >
              Abbrechen
            </button>
            <button className="taskMenuButton" type="submit">
              Aufgabe erstellen
            </button>
          </div>
        </form>
      }
    ></Overlay>
  );
};

export default AddTask;
