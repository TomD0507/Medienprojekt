import axios from "axios";
import { API_URL } from "../App";

interface loginData {
  id: number;
  name: string;
}

/** Function which returns (id, name) if a username with that password exists, for example use press
 * on the function while holding STRG/CTRL
 */
export const checkLogin = async (
  name: string,
  pw: string
): Promise<loginData> => {
  try {
    const res = await axios.get(`${API_URL}/login-user`, {
      params: { name: name, pw: pw },
    });
    const loginData: loginData = {
      id: res.data.id,
      name: res.data.name,
    };
    return loginData;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
//Example use
//   (async () => {
//     const loginData = await checkLogin('testUser', 'winterMP');
//     console.log(loginData.id, loginData.name); //loginData = {id: 6, name: "testUser"}
//   })();

/** Function which returns true if that username already exists and false if not. For an example, click on the
 * function while holding STRQ/CTRL
 */
export const usernameExists = async (name: string): Promise<boolean> => {
  try {
    const res = await axios.get(`${API_URL}/exists-user`, {
      params: { name: name },
    });
    const usernameExists = res.data.userExists;
    return usernameExists;
  } catch (err) {
    console.log(err);
    return false;
  }
};
//Example use
// (async () => {
//   const exists = await usernameExists('testUser');
//   console.log(exists); //exists = true
// })();

/** Function which first checks if the username already exists, if not then it prints out that it does not work and
 * returns false. For an example click on the function while holding STRG/CTRL.
 * */
export const registerUser = async (
  name: string,
  pw: string
): Promise<boolean> => {
  return (async () => {
    const exists = await usernameExists(name);
    if (exists) {
      console.log(
        "User with name:",
        name,
        "already exists! Choose a different name"
      );
      return false;
    } else {
      axios
        .post(`${API_URL}/register-user`, { name, pw })
        .then((r: any) => {
          console.log(r);
        })
        .catch((err: any) => {
          console.log(err);
        });
      return true;
    }
  })();
};
// Example use:
// registerUser('testUser', '123456'); // returns false since testUser already exists
// registerUser('Frodo Baggins', '123456'); // returns true since it got registered correctly
