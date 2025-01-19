import { useState } from "react";
import axios from "axios";
import "../styles/ManageRewards.css";
import { API_URL } from "../App";

function ManageRewards() {
  const [settingID, setSettingID] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [message, setMessage] = useState("");

  const [mode, setMode] = useState("");
  // Handle resetting rewards
  const handleResetRewards = async () => {
    try {
      const response = await axios.get(`${API_URL}/reset-rewards`);
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error resetting rewards.");
      console.error(error);
    }
  };

  // Handle updating a reward
  const handleUpdateReward = async () => {
    const settingIDparsed = parseInt(settingID);
    const settingValueParsed = parseInt(settingValue);
    if (!settingIDparsed || settingIDparsed <= 0) {
      setMessage("Invalid settingID. It must be greater than 0.");
      return;
    }
    if (!settingValueParsed || settingValueParsed < 0) {
      setMessage("Invalid settingValue. It must be greater than 0.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/update-reward`, {
        settingID: settingIDparsed,
        settingValue: settingValueParsed,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error updating reward.");
      console.error(error);
    }
  };

  // Handle updating mode
  const handleUpdateMode = async () => {
    if (!mode || isNaN(parseInt(mode))) {
      setMessage("Invalid mode. Please enter a valid integer.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}//update-mode`, {
        mode: parseInt(mode),
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error updating mode.");
      console.error(error);
    }
  };
  return (
    <div className="manage-rewards">
      <h2>Manage Rewards</h2>
      <div className="actions">
        <button onClick={handleResetRewards}>Reset Rewards</button>
      </div>
      <div className="update-form">
        <h3>Update Reward</h3>
        <label>
          Setting ID:
          <input
            type="number"
            value={settingID}
            onChange={(e) => setSettingID(e.target.value)}
          />
        </label>
        <label>
          Setting Value:
          <input
            type="number"
            value={settingValue}
            onChange={(e) => setSettingValue(e.target.value)}
          />
        </label>
        <button onClick={handleUpdateReward}>Update Reward</button>
      </div>
      {/* Update Mode Section */}
      <div className="update-mode">
        <h3>Update Mode</h3>
        <label>
          Mode:
          <input
            type="number"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          />
        </label>
        <button onClick={handleUpdateMode}>Update Mode</button>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ManageRewards;
