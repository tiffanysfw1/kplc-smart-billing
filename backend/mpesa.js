const axios = require("axios");
const moment = require("moment");
const base64 = require("base-64");
require("dotenv").config();

const {
  CONSUMER_KEY,
  CONSUMER_SECRET,
  PASSKEY,
  BUSINESS_SHORTCODE,
  CALLBACK_URL,
} = process.env;

// Get OAuth Token
const getAccessToken = async () => {
  const auth = base64.encode(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  return response.data.access_token;
};

// Initiate STK Push
const initiateStkPush = async ({ amount, phone }) => {
  try {
    const token = await getAccessToken();
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = base64.encode(BUSINESS_SHORTCODE + PASSKEY + timestamp);

    const payload = {
      BusinessShortCode: BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone.startsWith("254") ? phone : `254${phone.slice(1)}`, // Ensure format
      PartyB: BUSINESS_SHORTCODE,
      PhoneNumber: phone.startsWith("254") ? phone : `254${phone.slice(1)}`, // Ensure format
      CallBackURL: CALLBACK_URL,
      AccountReference: "KPLC Tokens",
      TransactionDesc: "Buy tokens",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("STK Push Error:", error?.response?.data || error.message);
    throw new Error("Failed to initiate STK Push.");
  }
};

module.exports = { initiateStkPush };
