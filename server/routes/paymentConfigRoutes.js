const express = require("express");
const PaymentConfig = require("../models/PaymentConfig");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const doc = await PaymentConfig.getSingleton();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
