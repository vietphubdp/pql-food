const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json(categories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug }).lean();
    if (!cat) return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json(cat);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
