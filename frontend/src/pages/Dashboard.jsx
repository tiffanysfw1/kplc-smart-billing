import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2"; // Import Charts
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import jsPDF from "jspdf"; // Import for PDF generation
import "chart.js/auto";
import "./Dashboard.css";

const Dashboard = () => {
  const [consumptionData, setConsumptionData] = useState([]);
  const [billingData, setBillingData] = useState([]);
  const [paymentData, setPaymentData] = useState([]); // New: Payment Data

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/dashboard-data");
      setConsumptionData(response.data.consumption);
      setBillingData(response.data.billing);
      setPaymentData(response.data.payments || []); // Fetch payments
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const consumptionChart = {
    labels: consumptionData.map((data) => data.date),
    datasets: [
      {
        label: "Electricity Consumption (kWh)",
        data: consumptionData.map((data) => data.usage),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  };

  const billingChart = {
    labels: billingData.map((data) => data.date),
    datasets: [
      {
        label: "Billing Amount (Ksh)",
        data: billingData.map((data) => data.amount),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };

  // Update payment chart to reflect progress
  const paymentChart = {
    labels: paymentData.map((data) => data.date),
    datasets: [
      {
        label: "Payments Made (Ksh)",
        data: paymentData.map((data) => data.status === "purchased" ? data.amount : 0), // Only show "purchased" payments
        backgroundColor: "rgba(75, 192, 192, 0.7)", // Green color for successful payments
      },
      {
        label: "Pending Payments (Ksh)",
        data: paymentData.map((data) => data.status === "pending" ? data.amount : 0), // Show pending payments
        backgroundColor: "rgba(255, 159, 64, 0.7)", // Orange color for pending payments
      },
    ],
  };

  // Optionally, if you want to track cumulative payments over time:
  const cumulativePaymentChart = {
    labels: paymentData.map((data) => data.date),
    datasets: [
      {
        label: "Cumulative Payments (Ksh)",
        data: paymentData.reduce((acc, data, index) => {
          const previous = index === 0 ? 0 : acc[index - 1]; // Get the previous total
          return [...acc, previous + (data.status === "purchased" ? data.amount : 0)]; // Add current amount if purchased
        }, []),
        backgroundColor: "rgba(153, 102, 255, 0.7)", // Purple color for cumulative payments
      },
    ],
  };

  const generateReport = () => {
    const doc = new jsPDF();
    doc.text("Electricity Consumption Report", 20, 10);
    let y = 20;
    consumptionData.forEach((item, index) => {
      doc.text(`${index + 1}. Date: ${item.date} - Usage: ${item.usage} kWh`, 20, y);
      y += 10;
    });

    doc.text("Billing History", 20, y + 10);
    y += 20;
    billingData.forEach((item, index) => {
      doc.text(`${index + 1}. Date: ${item.date} - Amount: ${item.amount} Ksh`, 20, y);
      y += 10;
    });

    doc.text("Payment History", 20, y + 10);
    y += 20;
    paymentData.forEach((item, index) => {
      doc.text(`${index + 1}. Date: ${item.date} - Amount: ${item.amount} Ksh - Status: ${item.status}`, 20, y);
      y += 10;
    });

    doc.save("Customer_Report.pdf");
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />

        <div className="dashboard-main">
          <div className="dasboard-container">
            <h1>Customer Analytics Dashboard</h1>
            <p>Track your electricity consumption, billing, and payments.</p>
          </div>

        <div className="charts-container">
            <div className="chart">
              <h3>Electricity Consumption</h3>
              <Bar data={consumptionChart} />
            </div>

            <div className="chart">
              <h3>Billing History</h3>
              <Line data={billingChart} />
            </div>

            <div className="chart">
              <h3>Payment History</h3>
              <Bar data={paymentChart} />
            </div>

            {/* If you want to display cumulative payments over time */}
            <div className="chart">
              <h3>Cumulative Payment Progress</h3>
              <Line data={cumulativePaymentChart} />
            </div>
          </div>

          <button className="report-button" onClick={generateReport}>
            📄 Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
