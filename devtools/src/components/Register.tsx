import "../styles/LoginSignup.css";
type LoginProps = {
  name: string;
  password: string;
  onPWChange: (field: string) => void;
  onNameChange: (field: string) => void;
  onSubmit: () => void;
  status: "idle" | "loading" | "error";
};
function Login({
  name,
  password,
  onPWChange,
  onNameChange,
  onSubmit,
  status,
}: LoginProps) {
  return (
    <div className="login_aligner">
      <div className="container">
        <div className="login_header">
          <div className="text">Register a new User</div>
          <div className="underline"></div>
        </div>
        <div className="inputs">
          <div className="input">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => onNameChange(e.target.value.trim())}
              disabled={status === "loading"}
            />
          </div>
          <div className="input">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => onPWChange(e.target.value)}
              disabled={status === "loading"}
            />
          </div>
        </div>

        {status === "error" && <div className="error-message"></div>}

        <div className="submit-container">
          <button
            className="submit"
            onClick={onSubmit}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Loading..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
