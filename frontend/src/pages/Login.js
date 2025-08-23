import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset previous messages

    try {
      const emailTrimmed = formData.email.trim();
      const { password } = formData;

      if (!emailTrimmed || !password) {
        setMessage("Email and password are required ❌");
        return;
      }

      const res = await API.post("/auth/login", { email: emailTrimmed, password });

      // Save token
      localStorage.setItem("token", res.data.token);

      // Decode JWT to check role
      const parseJwt = (token) => {
        try {
          return JSON.parse(atob(token.split(".")[1]));
        } catch (e) {
          return null;
        }
      };

      const user = parseJwt(res.data.token);

      if (!user) {
        setMessage("Failed to decode token ❌");
        return;
      }

      setMessage("Login successful ✅ Redirecting...");

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/cars");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      setMessage(err.response?.data?.message || "Invalid email or password ❌");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
