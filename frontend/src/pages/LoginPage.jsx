import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { demoCredentials } from "../app-data";
import { useAuth } from "../auth/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("buyer@smartspace.local");
  const [password, setPassword] = useState("User@123");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const session = login(email, password);
      navigate(session.role === "admin" ? "/admin" : "/app");
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <div className="login-shell">
      <section className="login-panel intro">
        <p className="eyebrow">Secure Access</p>
        <h1>Sign into SmartSpace</h1>
        <p>
          Role-aware access is enforced at the UI level. Admin users see a protected board with
          operational charts, while normal users land in buyer-facing workspaces.
        </p>

        <div className="credential-list">
          {demoCredentials.map((item) => (
            <article className="credential-card" key={item.email}>
              <strong>{item.role}</strong>
              <span>{item.email}</span>
              <span>{item.password}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="login-panel form">
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Workspace Login</p>
            <h2>Enter credentials</h2>
          </div>
          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <div className="banner error">{error}</div> : null}
          <button className="primary-button full-width" type="submit">
            Login
          </button>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
