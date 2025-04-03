import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaComments,
  FaTimes,
  FaPaperPlane,
} from "react-icons/fa";
import "./CustomerService.css";

const CustomerService = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const faqResponses = {
    "how do i pay my bill": "You can pay your bill via M-Pesa Paybill 888888. Enter your meter number as the account number.",
    "how can i check my bill": "You can check your bill by logging into your account on our portal or dialing *977#.",
    "what should i do if my power is disconnected": "If your power is disconnected, pay your outstanding bill and contact customer support for reconnection.",
    "how do i buy electricity tokens": "You can buy tokens via M-Pesa Paybill 888888 or from our website.",
    "hello": "How may I help you?",
  };

  const sendMessage = () => {
    if (userMessage.trim() === "") return;

    const userInput = userMessage.toLowerCase();
    let botResponse = faqResponses[userInput] || "I'm sorry, I didn't understand that. Please rephrase or contact our support.";

    setChatMessages([...chatMessages, { sender: "user", text: userMessage }]);

    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: "agent", text: botResponse }]);
    }, 1000);

    setUserMessage("");
  };


  const findLocation = () => {

    window.location.href = "https://www.google.com/maps/search/KPLC+office+Kericho/";
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="customer-service-container">
          <h1>Customer Support</h1>
          <p>Need assistance? We are here to help you 24/7.</p>

          <div className="service-options">
          
            <div className="service-card">
              <FaPhoneAlt className="service-icon phone-icon" />
              <h3>📞 Call Support</h3>
              <p>Contact us anytime at:</p>
              <p><strong>+254 706 538 579</strong></p>
              <button className="service-btn">Call Now</button>
            </div>

           
            <div className="service-card">
              <FaComments className="service-icon chat-icon" />
              <h3>💬 Live Chat</h3>
              <p>Get quick help from our agents.</p>
              <button className="service-btn chat-btn" onClick={toggleChat}>
                Start Chat
              </button>
            </div>

          
            <div className="service-card">
              <FaEnvelope className="service-icon email-icon" />
              <h3>📩 Email Support</h3>
              <p>Send us an email at:</p>
              <p><strong>support@kplcbilling.com</strong></p>
              <button className="service-btn email-btn">Send Email</button>
            </div>

         
            <div className="service-card">
              <FaMapMarkerAlt className="service-icon location-icon" />
              <h3>📍 Visit Us</h3>
              <p>Find the nearest KPLC office in Kericho.</p>
              <button className="service-btn location-btn" onClick={findLocation}>
                Find Location
              </button>
            </div>
          </div>
        </div>

        {isChatOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <h3>Live Chat</h3>
              <FaTimes className="close-chat" onClick={toggleChat} />
            </div>
            <div className="chat-body">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="chat-footer">
              <input
                type="text"
                placeholder="Type a message..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
              />
              <button onClick={sendMessage}>
                <FaPaperPlane />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerService;
