import React, { useState } from "react";
import "../styles/AddTask.css"; // Wiederverwendung des AddTask-Stils
import Overlay from "./Overlay";
import { isValidDate, Priority, TaskProps } from "./Task";
import { isValidDateString } from "./AddTask";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface EditTaskProps {
  id: number;
  title: string;
  description: string;
  subtasks: { name: string; done: boolean }[];
  priority: Priority;
  deadline: Date;
  done: boolean;
  reminder: string;
  repeat: string;
  deleted: boolean;
  onClose: () => void;
  onDelete: () => void;
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
  deleted,
  onClose,
  onDelete,
  onSave,
  isOpen,
}: EditTaskProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [subtasks, setSubtasks] = useState(initialSubtasks);
  const [priority, setPriority] = useState<Priority>(initialPriority);
  const [deadlineDate, setDeadlineDate] = useState(() => {
    if (isValidDate(initialDeadline)) {
      const year = initialDeadline.getFullYear();
      const month = (initialDeadline.getMonth() + 1)
        .toString()
        .padStart(2, "0"); // Ensure 2 digits
      const day = initialDeadline.getDate().toString().padStart(2, "0");
      const hours = initialDeadline.getHours().toString().padStart(2, "0");
      const minutes = initialDeadline.getMinutes().toString().padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    return ""; // Fallback if invalid or empty
  });

  const [reminder, setReminder] = useState(initialReminder);
  const [repeat, setRepeat] = useState(initialRepeat);

  const addSubtask = () =>
    setSubtasks([...subtasks, { name: "", done: false }]);
  const updateSubtask = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].name = value;
    setSubtasks(updatedSubtasks);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Bitte einen Titel hinzufügen.");
      return;
    }

    const deadline = new Date(`${deadlineDate}`);
    onSave({
      id,
      title,
      description,
      subtasks: subtasks.filter((subtask) => subtask.name.trim() !== ""),
      priority,
      deadline,
      done,
      reminder: isValidDate(deadline) ? reminder : "Nie",
      repeat: isValidDate(deadline) ? repeat : "Nie",
      deleted,
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
                  value={subtask.name}
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
            <label className="add_item">
              <button
                className="taskMenuButton"
                type="button"
                onClick={addSubtask}
              >
                <FontAwesomeIcon icon={faPlus} />
                Unteraufgabe hinzufügen
              </button>
            </label>
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
            Termin:
            <div className="add_item">
              <input
                type="datetime-local"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
            </div>
          </label>
          {isValidDateString(deadlineDate) && (
            <label>
              Erinnerung hinzufügen:
              <div className="add_item">
                <select
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                >
                  <option value="Nie">Nie</option>
                  <option value="1 Stunde vorher">1 Stunde vorher</option>
                  <option value="6 Stunden vorher">6 Stunden vorher</option>
                  <option value="12 Stunden vorher">12 Stunden vorher</option>
                  <option value="1 Tag vorher">1 Tag vorher</option>
                  <option value="3 Tage vorher">3 Tage vorher</option>
                  <option value="1 Woche vorher">1 Woche vorher</option>
                </select>
              </div>
            </label>
          )}
          {isValidDateString(deadlineDate) && (
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
          )}
          <div>
            <button
              className="taskMenuButton deleteButton"
              type="button"
              onClick={onDelete}
            >
              Löschen
            </button>
            <button className="taskMenuButton" type="submit">
              Speichern
            </button>
          </div>
        </form>
      }
    ></Overlay>
  );
}

export default EditTask;
