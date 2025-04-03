import React from "react";
import { FaFilePdf, FaDownload } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Download.css";

const files = [
  { id: 1, name: "Electricity Bill Invoice (March 2025)", url: "/files/march-invoice.pdf" },
  { id: 2, name: "Billing Guide Manual", url: "/files/billing-guide.pdf" },
  { id: 3, name: "Terms and Conditions", url: "/files/terms.pdf" },
];

const Download = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="download-container">
          <h1>📥 Download Center</h1>
          <p>Get access to invoices, user manuals, and more.</p>

          <div className="download-list">
            {files.map((file) => (
              <div key={file.id} className="download-item">
                <FaFilePdf className="file-icon" />
                <h3>{file.name}</h3>
                <a href={file.url} download className="download-btn">
                  <FaDownload className="download-icon" /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;
