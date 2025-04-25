import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./BuyTokens.css";

const BuyTokens = () => {
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [isBankPaid, setIsBankPaid] = useState(false);

  // List of banks
  const banks = ["Equity Bank", "KCB Bank", "Cooperative Bank", "ABSA Bank", "Standard Chartered"];

  // List of 47 Kenyan counties
  const counties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", "Uasin Gishu", "Meru", "Kakamega", "Embu",
    "Nyeri", "Kisii", "Bungoma", "Narok", "Kericho", "Homa Bay", "Kitui", "Laikipia", "Kilifi", "Baringo", "Vihiga",
    "Siaya", "Mandera", "Marsabit", "Samburu", "Kwale", "Turkana", "Garissa", "Tana River", "Elgeyo Marakwet", "Trans Nzoia",
    "Wajir", "West Pokot", "Lamu", "Tharaka Nithi", "Taita Taveta", "Isiolo", "Nandi", "Bomet", "Busia", "Migori", "Kajiado",
    "Nyandarua", "Makueni", "Nyamira", "Taveta"
  ];

  // Function to format phone number to international format (Kenya)
  const formatPhoneNumber = (phone) => {
    if (phone.startsWith("0")) {
      return `254${phone.slice(1)}`; // Replace leading '0' with '254'
    }
    return phone; // Assume it's already in the correct format
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setMessage("");
    setToken("");
    setIsLoading(true);

    // Validation checks
    if (!meterNumber || meterNumber.length !== 11) {
      setMessage("⚠️ Meter number must be exactly 11 digits.");
      setIsLoading(false);
      return;
    }

    if (!amount || amount <= 0) {
      setMessage("⚠️ Please enter a valid amount.");
      setIsLoading(false);
      return;
    }

    // If payment method is MPESA, validate phone number format
    if (paymentMethod === "mpesa") {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      if (formattedPhoneNumber.length !== 12 || !formattedPhoneNumber.startsWith("254")) {
        setMessage("⚠️ Phone number must be in the correct international format (e.g., +254701234567).");
        setIsLoading(false);
        return;
      }
    }

    if (paymentMethod === "bank" && (!accountNumber || !selectedCounty)) {
      setMessage("⚠️ Please enter your bank account number and select a branch.");
      setIsLoading(false);
      return;
    }

    if (paymentMethod === "paypal") {
      const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=tiffanyjemosop@gmail.com&amount=${amount}&currency_code=USD&item_name=Electricity+Tokens`;
      window.location.href = paypalUrl;
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/buy-tokens", {
        meterNumber,
        amount,
        phoneNumber: paymentMethod === "mpesa" ? formatPhoneNumber(phoneNumber) : null,
        paymentMethod,
        selectedBank,
        accountNumber,
        selectedCounty,
      });

      setMessage(response.data.message || "✅ Payment successful! Generating token...");

      setTimeout(() => {
        setToken(`🔋 Token: ${Math.floor(100000000 + Math.random() * 900000000)}`);
        setIsLoading(false);

        setTimeout(() => {
          setMeterNumber("");
          setAmount("");
          setPhoneNumber("");
          setPaymentMethod("mpesa");
          setSelectedBank("");
          setAccountNumber("");
          setSelectedCounty("");
          setMessage("");
          setToken("");
        }, 10000); // Refresh after 10 seconds
      }, 3000);

    } catch (error) {
      setMessage(error.response?.data?.error || "⚠️ Error processing payment! Try again.");
      setIsLoading(false);
    }
  };

  const handleBankPaymentConfirmation = () => {
    setIsBankPaid(true);
    setTimeout(() => {
      setToken(`🔋 Token: ${Math.floor(100000000 + Math.random() * 900000000)}`);
    }, 2000);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="buy-tokens">
          <h2>Buy Electricity Tokens</h2>
          <form onSubmit={handlePurchase}>
            <label>Meter Number:</label>
            <input
              type="text"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              required
              maxLength="11"
              placeholder="Enter 11-digit meter number"
            />

            <label>Amount (Ksh):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="10"
            />

            <label>Payment Method:</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
              <option value="mpesa">📲 M-Pesa</option>
              <option value="paypal">💳 PayPal</option>
              <option value="bank">🏦 Bank Transfer</option>
            </select>

            {paymentMethod === "mpesa" && (
              <>
                <label>Phone Number:</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  maxLength="10"
                  placeholder="Enter 10-digit phone number"
                />
              </>
            )}

            {paymentMethod === "bank" && (
              <>
                <label>Select Your Bank:</label>
                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} required>
                  <option value="">-- Select Bank --</option>
                  {banks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>

                {selectedBank && (
                  <>
                    <label>Enter Account Number:</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      placeholder="Enter Account Number"
                    />
                  </>
                )}

                {selectedBank && (
                  <>
                    <label>Select County (Branch Location):</label>
                    <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required>
                      <option value="">-- Select County --</option>
                      {counties.map((county) => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {selectedCounty && (
                  <div className="bank-details">
                    <h3>Bank Details</h3>
                    <p><strong>Bank:</strong> {selectedBank}</p>
                    <p><strong>Account Number:</strong> {accountNumber}</p>
                    <p><strong>Branch Location:</strong> {selectedCounty}</p>
                    <p><strong>Reference:</strong> Use your meter number</p>
                    <small>After payment, click 'Confirm Payment' below.</small>
                  </div>
                )}
              </>
            )}

            {paymentMethod === "bank" ? (
              <button type="button" onClick={handleBankPaymentConfirmation} disabled={isBankPaid || !selectedCounty}>
                {isBankPaid ? "Payment Confirmed ✅" : "Confirm Payment"}
              </button>
            ) : (
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : `Pay with ${paymentMethod.toUpperCase()}`}
              </button>
            )}
          </form>

          {message && <p className={message.includes("successful") ? "success" : "error"}>{message}</p>}
          {token && <h3 className="success">{token}</h3>}
        </div>
      </div>
    </div>
  );
};

export default BuyTokens;
