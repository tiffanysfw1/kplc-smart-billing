import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="about-us">
          <div className="about-header">
            <h1>About Us</h1>
            <p>Empowering You with Smart Electricity Billing & Management</p>
          </div>

          <div className="about-section">
            <h2>Who We Are</h2>
            <p>
              <strong>KPLC Smart Billing System</strong> is an innovative electricity 
              management platform designed to simplify billing, payments, and token purchases. 
              Our goal is to enhance efficiency, transparency, and customer satisfaction.
            </p>
          </div>

          <div className="about-section">
            <h2>Our Mission</h2>
            <p>
              We aim to provide an automated and user-friendly billing system, eliminating 
              manual processes and improving accuracy in electricity billing.
            </p>
          </div>

          <div className="about-features">
            <h2>Why Choose Us?</h2>
            <div className="features-container">
              <div className="feature-card">
                <i className="fas fa-bolt"></i>
                <h3>Automated Billing</h3>
                <p>No more manual meter readings—our system handles everything.</p>
              </div>
              <div className="feature-card">
                <i className="fas fa-mobile-alt"></i>
                <h3>Instant Token Purchases</h3>
                <p>Buy electricity tokens anytime, anywhere.</p>
              </div>
              <div className="feature-card">
                <i className="fas fa-lock"></i>
                <h3>Secure Payments</h3>
                <p>Make payments safely through M-Pesa and bank transfers.</p>
              </div>
              <div className="feature-card">
                <i className="fas fa-bell"></i>
                <h3>Real-time Notifications</h3>
                <p>Get SMS & email alerts about your bills and payments.</p>
              </div>
            </div>
          </div>

          <div className="contact-us">
            <h2>Contact Us</h2>
            <p>📍 Kericho, Kenya | 📧 support@kplcsmart.com | 📞 +254 706538579/ +254 788472627</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
