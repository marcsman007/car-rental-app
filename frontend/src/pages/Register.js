import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    adminSecret: ""
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { name, email, password, phone, role, adminSecret } = formData;
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        phone,
        role,
        adminSecret
      });
      localStorage.setItem("token", res.data.token);
      setMessage("Registration successful ✅ Redirecting...");
      navigate("/"); // Redirect to home after successful registration
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Registration failed ❌");
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone (optional)" value={formData.phone} onChange={handleChange} />

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {/* Show admin secret input only if role is admin */}
        {formData.role === "admin" && (
          <input type="password" name="adminSecret" placeholder="Admin Secret" value={formData.adminSecret} onChange={handleChange} required />
        )}

        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Register;
