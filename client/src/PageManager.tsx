import { useState } from "react";
import Login from "./components/Login";
import "./index.css";
import App from "./App";

function PageManager() {
  //userID wird bei login gesetzt
  const [userID, setUserID] = useState<number | null>(null);

  const [formData, setFormData] = useState<{ name: string; password: string }>({
    name: "",
    password: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setStatus("loading");
    console.log("Submitting form data:", formData);

    //  // todo: backencall: isRegistered(user, password) -> userid

    // Dummy logindaten. ersetzen mit: backendcall gibt ne id zurück oder nicht
    const isAuthenticated =
      formData.name === "user" && formData.password === "password";

    if (isAuthenticated) {
      console.log("Login successful!");
      setStatus("idle");
      setUserID(1);
    } else {
      console.log("Login failed: incorrect username or password.");
      setStatus("error");
    }
    //input reset after login was checked
    handleInputChange("password", "");
    handleInputChange("name", "");
  };

  return userID === null ? (
    <div>
      <Login
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        status={status}
      />
    </div>
  ) : (
    <App userID={userID} />
  );
}

export default PageManager;
