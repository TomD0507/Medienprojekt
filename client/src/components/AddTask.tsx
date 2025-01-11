import { useState } from "react";
import Overlay from "./Overlay";
import { TaskProps, Priority, isValidDate } from "./Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
export function isValidDateString(datestring: string) {
  const date = new Date(datestring);
  return date instanceof Date && !isNaN(date.getTime());
}
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
    const ddate = new Date(`${deadlineDate}`);
    const newTask = {
      id: id,
      title,
      description,
      subtasks: subtasks
        .filter((task) => task.trim() !== "")
        .map((task) => ({ name: task.trim(), done: false })),
      priority,
      deadline: ddate,
      reminder: isValidDate(ddate) ? reminder : "Nie",
      repeat: isValidDate(ddate) ? repeat : "Nie",
      done: false,
      deleted: false,
    };
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
                min={new Date().toISOString().slice(0, 16)} // limitsDatepicker to current date
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
          <div className="contain_menu_buttons">
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
