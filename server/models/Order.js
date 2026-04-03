const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    quantity: { type: Number, min: 1 },
    image: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderCode: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    status: {
      type: String,
      enum: ["processing", "completed", "cancelled", "in_transit"],
      default: "processing",
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      note: String,
    },
    timeline: [
      {
        label: String,
          detail: String,
          at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
