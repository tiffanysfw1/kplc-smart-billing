import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Contact.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="dashboard-container">
    <Sidebar />
    <div className="dashboard-content">
      <Navbar />
      </div>
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We’d love to hear from you! Reach out with any inquiries or feedback.</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>Our Office</h2>
          <p>📍 Kericho, Kenya</p>
          <p>📧 support@kplcbilling.com</p>
          <p>📞 +254 706 538 579</p>
          <p>⏰ Mon - Fri: 9:00 AM - 5:00 PM</p>
        </div>

        <div className="contact-form">
          <h2>Send Us a Message</h2>
          {submitted ? (
            <p className="success-message">✅ Thank you! Your message has been sent.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
              />
              <button type="submit">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ContactUs;
