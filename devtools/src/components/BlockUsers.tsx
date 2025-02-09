import { useState } from "react";
import axios from "axios";
import "../styles/ManageRewards.css";
import { API_URL } from "../App";

function BlockUsers() {
  const [settingID, setSettingID] = useState("");
  const [settingValue, setSettingValue] = useState("false");
  const [message, setMessage] = useState("");

  // Handle updating the user block state
  const handleUpdateUserBlock = async () => {
    const settingIDparsed = Number(settingID);
    if (!settingIDparsed || settingIDparsed <= 0) {
      setMessage("Invalid userID. It must be a positive number.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/block-user`, {
        userID: settingIDparsed, // Fix key name
        blockedState: settingValue, // Fix key name
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error updating user state.");
      console.error(error);
    }
  };

  return (
    <div className="manage-rewards">
      <h2>Manage User Blocking</h2>

      <div className="update-form">
        <h3>Update a blocked user</h3>
        <label>
          UserID:
          <input
            type="number"
            value={settingID}
            onChange={(e) => setSettingID(e.target.value)}
          />
        </label>
        <label>
          Block User:
          <select
            value={settingValue}
            onChange={(e) => setSettingValue(e.target.value)}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <button onClick={handleUpdateUserBlock}>Update User State</button>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default BlockUsers;
