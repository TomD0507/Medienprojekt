import { useState } from "react";

import { registerUser } from "./helpers/loginHelper";
import Register from "./components/Register";
function PageManager() {
  //userID wird bei login gesetzt
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

    const registered = await registerUser(loginName, password);

    if (registered) {
      console.log("User successfully created!");
      setStatus("idle");
    } else {
      console.log("There already exists a User with that name.");
      setStatus("error");
    }
    //input reset after login was checked
    handleNameChange("");
    handlePwChange("");
  };

  return (
    <Register
      name={loginName}
      password={password}
      onNameChange={handleNameChange}
      onPWChange={handlePwChange}
      onSubmit={handleSubmit}
      status={status}
    />
  );
}

export default PageManager;
