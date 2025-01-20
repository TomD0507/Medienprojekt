import { useState } from "react";
import { registerUser } from "../helpers/loginHelper";
import "../styles/LoginSignup.css";

function Login() {
  const [loginName, setName] = useState("");
  const [password, setPw] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "error">("error");
  const handleSubmit = async () => {
    setStatus("loading");
    if (!loginName.trim()) {
      alert("Bitte einen Namen hinzufügen.");
      setStatus("idle");
      return;
    }
    if (!password.trim()) {
      alert("Bitte ein Passwort vergeben.");
      setStatus("idle");
      return;
    }
    const registered = await registerUser(loginName, password);

    if (registered) {
      console.log("User successfully created!");
      setStatus("idle");
    } else {
      console.log("There already exists a User with that name.");
      setStatus("error");
    }
    //input reset after login was checked
    setName("");
    setPw("");
  };
  return (
    <div className="login_aligner">
      <div className="container">
        <div className="login_header">
          <div className="text">Register new User</div>
          <div className="underline"></div>
        </div>
        <div className="inputs">
          <div className="input">
            <input
              type="text"
              placeholder="Name"
              value={loginName}
              onChange={(e) => setName(e.target.value.trim())}
              disabled={status === "loading"}
            />
          </div>
          <div className="input">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPw(e.target.value.trim())}
              disabled={status === "loading"}
            />
          </div>
        </div>

        {status === "error" && (
          <div className="error-message">
            There already exists a user with that name.
          </div>
        )}

        <div className="submit-container">
          <button
            className="submit"
            onClick={handleSubmit}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Loading..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
