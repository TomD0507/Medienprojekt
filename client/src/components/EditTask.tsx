import React, { useState } from "react";
import "../styles/AddTask.css"; // Wiederverwendung des AddTask-Stils
import Overlay from "./Overlay";
import { Priority, TaskProps } from "./Task";

interface EditTaskProps {
  id: number;
  title: string;
  description: string;
  subtasks: { name: string; done: boolean }[];
  priority: Priority;
  deadline: string; // Kombiniert Datum und Uhrzeit im Format "YYYY-MM-DD HH:mm"
  done: boolean;
  reminder: string;
  repeat: string;
  onClose: () => void;
  onSave: (updatedTask: TaskProps) => void;
  isOpen: boolean;
}

function EditTask({
  id,
  title: initialTitle,
  description: initialDescription,
  subtasks: initialSubtasks,
  priority: initialPriority,
  deadline: initialDeadline,
  done,
  reminder: initialReminder,
  repeat: initialRepeat,
  onClose,
  onSave,
  isOpen,
}: EditTaskProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [subtasks, setSubtasks] = useState(
    initialSubtasks.map((subtask) => subtask.name)
  );
  const [priority, setPriority] = useState<Priority>(initialPriority);
  const [deadlineDate, setDeadlineDate] = useState(() => {
    if (initialDeadline && initialDeadline.split(" ").length === 2) {
      return initialDeadline.split(" ")[0]; // Date part
    }
    return ""; // Fallback if invalid or empty
  });

  const [deadlineTime, setDeadlineTime] = useState(() => {
    if (initialDeadline && initialDeadline.split(" ").length === 2) {
      return initialDeadline.split(" ")[1]; // Time part
    }
    return ""; // Fallback if invalid or empty
  });
  const [reminder, setReminder] = useState(initialReminder);
  const [repeat, setRepeat] = useState(initialRepeat);

  const addSubtask = () => setSubtasks([...subtasks, ""]);
  const updateSubtask = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = value;
    setSubtasks(updatedSubtasks);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Bitte einen Titel hinzufügen.");
      return;
    }

    const deadline = new Date(`${deadlineDate}T${deadlineTime}`);
    onSave({
      id,
      title,
      description,
      subtasks: subtasks
        .filter((subtask) => subtask.trim() !== "")
        .map((subtask) => ({ name: subtask, done: false })),
      priority,
      deadline,
      done,
      reminder,
      repeat,
    });

    onClose();
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      children={
        <form onSubmit={handleSave} className="add-task-form">
          <h3>Aufgabe bearbeiten</h3>
          <label>
            Titel:
            <div className="add_item">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titel bearbeiten"
              />
            </div>
          </label>
          <label>
            Beschreibung:
            <div className="add_item">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibung bearbeiten"
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
                    onClick={(e) => {
                      e.preventDefault();
                      setSubtasks(subtasks.filter((_, i) => i !== index));
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "red",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
            {subtasks.length < 4 && (
              <button type="button" onClick={addSubtask}>
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
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
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
            <button type="submit">Speichern</button>
            <button type="button" onClick={onClose}>
              Abbrechen
            </button>
          </div>
        </form>
      }
    ></Overlay>
  );
}

export default EditTask;
