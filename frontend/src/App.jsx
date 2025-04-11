import { Routes, Route } from "react-router-dom"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AboutUs from "./pages/AboutUs";
import CustomerService from "./pages/CustomerService";
import Download from "./pages/Download";
import Contact from "./pages/Contact";
import Billing from "./pages/Billing"; 
import BuyTokens from "./pages/BuyTokens";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";
import ForgotPassword from "./pages/ForgotPassword";
import "./App.css"; 

function App() {
  return (
    <div className="center-container">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/customerservice" element={<CustomerService />} />
        <Route path="/download" element={<Download />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/buytokens" element={<BuyTokens />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </div>
  );
}
export default App;