import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "../App";
import "../styles/SchowUsers.css";
type userListProps = {
  name: string;
  displayName: string;
};
function ShowUsers() {
  const [userList, setUserList] = useState<
    Record<string, Record<string, number>>
  >({});
  const [dates, setDates] = useState<string[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Promise.all([
          axios.get(`${API_URL}/get-user-list`, { params: {} }),
        ]);
        const data = response[0].data;
        const userData: Record<string, Record<string, number>> = {};
        const newdates = new Set<string>();
        console.log("newdate", newdates);
        data.forEach(
          (element: {
            name: number;
            displayName: string;
            login_date: Date;
            login_count: number;
          }) => {
            const d = new Date(element.login_date).toDateString();
            newdates.add(d);

            if (userData[element.displayName] == null) {
              userData[element.displayName] = {};
            }

            userData[element.displayName][d] = element.login_count;
          }
        );
        console.log("newdate", newdates);
        setDates([...newdates]);
        setUserList(userData);
      } catch (error) {}
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="elemwrapper">
        <div className="elem">Name: </div>

        {dates.map((date) => (
          <div className="elem" key={date}>
            {date}
          </div>
        ))}
      </div>

      <div>
        {Object.keys(userList).map((displayName) => (
          <div className="elemwrapper" key={displayName}>
            <div className="elem">{displayName}</div>
            {dates.map((element) => (
              <div
                className={
                  userList[displayName][element] ? "elem" : "elem empty"
                }
              >
                {userList[displayName][element] || 0}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default ShowUsers;
