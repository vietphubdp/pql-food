const express = require("express");
const ContactConfig = require("../models/ContactConfig");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const doc = await ContactConfig.getSingleton();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
