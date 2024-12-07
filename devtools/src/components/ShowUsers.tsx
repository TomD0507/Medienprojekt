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
    <div>
      {userList.map((user, index) => (
        <>
          <div key={index}>{user.name}</div>{" "}
          <div key={index}>{user.displayName}</div>
        </>
      ))}
    </div>
  );
}

export default ShowUsers;
