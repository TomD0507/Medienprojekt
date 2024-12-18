import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "../App";
type userListProps = {
  name: string;
  displayName: string;
};
function ShowUsers() {
  const [userList, setUserList] = useState<userListProps[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Promise.all([
          axios.get(`${API_URL}/get-user-list`, { params: {} }),
        ]);
        setUserList(response[0].data);
      } catch (error) {
        console.error("Error fetching tasks or subtasks:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {userList.map((user) => (
        <div className="side_by_side">
          <div>{"Name: " + user.name}</div>
          <div>{"Displayname: " + user.displayName}</div>
        </div>
      ))}
    </>
  );
}

export default ShowUsers;
