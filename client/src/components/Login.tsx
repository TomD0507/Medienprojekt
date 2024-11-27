import "../styles/LoginSignup.css";
type LoginProps = {
  formData: {
    name: string;
    password: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  status: "idle" | "loading" | "error";
};
function Login({ formData, onInputChange, onSubmit, status }: LoginProps) {
  return (
    <div className="container">
      <div className="login_header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        <div className="input">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value.trim())}
            disabled={status === "loading"}
          />
        </div>

        <div className="input">
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            disabled={status === "loading"}
          />
        </div>
      </div>

      {status === "error" && (
        <div className="error-message">
          Incorrect username or password. Please try again.
        </div>
      )}

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
  );
}

export default Login;
