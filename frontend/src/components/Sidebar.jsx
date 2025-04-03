import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h1>KPLC</h1>
      <ul>
        <li><Link to="/dashboard">📊 Dashboard</Link></li>
        <li><Link to="/buytokens">⚡Buy Tokens</Link></li>
        <li><Link to="/billing">💰 Billing</Link></li>
        <li><Link to="/about-us">💡About Us</Link></li>
        <li><Link to="/Customerservice">☎️Customer Service</Link></li>
        <li><Link to="/Download">⬇️Download</Link></li>
        <li><Link to="/Contact">📞Contact Us</Link></li>
        <li><Link to="/profile">👤 Profile</Link></li>
        <li><Link to="/logout">⏏ Logout</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
