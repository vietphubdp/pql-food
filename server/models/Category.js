const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String, default: "shopping_basket" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
