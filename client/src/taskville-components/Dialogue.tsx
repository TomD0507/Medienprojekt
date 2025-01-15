import "../styles/TaskVille/Dialogue.css";
import testAvatar from "../assets/Taskville/avatar-testZagreus.png";
import dialogueText from "../text.json";

export default function Dialogue() {
  return (
    <div className="grid-container">
      <div className="textbox">{dialogueText.dialogue.greeting[1]}</div>
      <div className="image">
        <img src={testAvatar} />
      </div>
    </div>
  );
}
