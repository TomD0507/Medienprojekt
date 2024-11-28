import { useState } from "react";
import Login from "./components/Login";
import App from "./App";

import { checkLogin } from "./helpers/loginHelper";
function PageManager() {
  //userID wird bei login gesetzt
  const [userID, setUserID] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const [loginName, setName] = useState("");
  const [password, setPw] = useState("");

  const handleNameChange = (e: string) => {
    setName(e);
  };

  const handlePwChange = (e: string) => {
    setPw(e);
  };

  const handleSubmit = async () => {
    setStatus("loading");

    const { name, id } = await checkLogin(loginName, password);
    //id is -1 when the login failed
    const isAuthenticated = id != -1;

    if (isAuthenticated) {
      console.log("Login successful!");
      setStatus("idle");
      setUserID(id);
      setDisplayName(name);
    } else {
      console.log("Login failed: incorrect username or password.");
      setStatus("error");
    }
    //input reset after login was checked
    handleNameChange("");
    handlePwChange("");
  };

  return userID === null ? (
    <Login
      name={loginName}
      password={password}
      onNameChange={handleNameChange}
      onPWChange={handlePwChange}
      onSubmit={handleSubmit}
      status={status}
    />
  ) : (
    <App userID={userID} displayName={displayName} />
  );
}

export default PageManager;
