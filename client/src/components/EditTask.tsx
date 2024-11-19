/* eslint-disable @typescript-eslint/no-unused-vars */

import "../styles/EditTask.css";

//menu zum hinzufügen von Tasks

interface EditTaskProps {
  user: string;
  onClose: () => void;
} // user identification fürs erstellen vom task? oder backcall zum erstelln von taks nach schließen?
function EditTask({ onClose }: EditTaskProps) {
  return (
    <>
      <h2>Overlay Content</h2>
      <p>custom overlay</p>
      <button className="addTask" onClick={onClose}>
        <span>&#x2713;</span>
      </button>
    </>
  );
}
export default EditTask;
