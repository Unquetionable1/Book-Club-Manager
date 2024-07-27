import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      } else if (data.access_token) {
        localStorage.setItem("jwt_token", data.access_token);
        localStorage.setItem("user_id", data.user_id);
        navigate("/"); // Corrected spelling
      }
    } catch (error) {
      setError(error.message);
    }
  };
  const HandleClick = () => {
    navigate("/register");
  };

  return (
    <div className="container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <button className="link" onClick={HandleClick}>
          Register if you don't have an account
        </button>
      </form>

      {/* <Link to={<Register/>}>Register if you do not hav ean account.</Link> */}
    </div>
  );
}

export default Login;
