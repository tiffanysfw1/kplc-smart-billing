import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Load remembered credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Validate Email Format
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("⚠️ All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("❌ Invalid email format.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });

      console.log("✅ Login successful!", response.data);

      // Save token in localStorage
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user)); // Store user details

      // Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      // ✅ Redirect to Dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);
      setError(error.response?.data?.error || "❌ Incorrect email or password.");
    }
  };

  return (
    <div className="auth-container">
      <div className="login-box">
        <h1>🔒 Sign In</h1>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>

          <button type="submit" className="login-button">Sign In</button>
        </form>

        <div className="login-links">
          <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
          <p>
            Don't have an account? <a href="/register" className="sign-up-link">Sign Up</a>
          </p>
          <i>Copyright © KPLC Billing System 2025.</i>
        </div>
      </div>
    </div>
  );
};

export default Login;
