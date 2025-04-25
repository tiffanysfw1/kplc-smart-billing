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

// Generate OAuth token
const getAccessToken = async () => {
  const auth = base64.encode(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  return res.data.access_token;
};

// STK Push
const initiateStkPush = async ({ amount, phone }) => {
  const token = await getAccessToken();
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = base64.encode(BUSINESS_SHORTCODE + PASSKEY + timestamp);

  const payload = {
    BusinessShortCode: BUSINESS_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: BUSINESS_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: CALLBACK_URL,
    AccountReference: "KPLC Tokens",
    TransactionDesc: "Buy tokens",
  };

  const res = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
};

module.exports = { initiateStkPush };
