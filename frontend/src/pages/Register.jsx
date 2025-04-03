import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    meterNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("Registration Successful!");
      
      // Save credentials for Login page
      localStorage.setItem("registeredEmail", formData.email);
      localStorage.setItem("registeredPassword", formData.password);

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      alert(`Error: ${error.response?.data.message || "Registration failed"}`);
    }
  };

  return (
    <div className="auth-container">kplc-smart-billing
      <div className="register-box">
        <h2>🔒 Sign Up</h2>
        <form onSubmit={handleRegister}>
          <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="text" name="meterNumber" placeholder="KPLC Meter Number" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
