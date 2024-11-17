
import "../styles/AddTask.css";

//menu zum hinzufügen von Tasks

interface AddTaskProps{
    user:string;
    onClose: () => void;
}// user identification fürs erstellen vom task? oder backcall zum erstelln von taks nach schließen?
function AddTask({user,onClose}:AddTaskProps){
    return <><h2>Overlay Content</h2>
        <p>custom overlay</p>
        <button className="addTask" onClick={onClose}>
          AddTask
        </button>
        </>

}
export default AddTask;