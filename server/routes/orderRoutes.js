const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { auth } = require("../middleware/auth");

const router = express.Router();

function genOrderCode() {
  return `PQL-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

router.post("/", auth(true), async (req, res) => {
  try {
    const { items, shippingAddress, shippingMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }
    const lineItems = [];
    let subtotal = 0;
    for (const line of items) {
      const rawId = line.productId;
      const productId =
        rawId && typeof rawId === "object" && rawId !== null && rawId._id != null
          ? rawId._id
          : rawId;
      if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
      }
      const p = await Product.findById(productId).lean();
      if (!p) return res.status(400).json({ message: "Sản phẩm không tồn tại" });
      const qty = Math.max(1, parseInt(line.quantity, 10) || 1);
      const price = p.price;
      subtotal += price * qty;
      lineItems.push({
        product: p._id,
        name: p.name,
        price,
        quantity: qty,
        image: (p.images && p.images[0]) || "",
      });
    }
    const isExpress = shippingMethod === "express";
    const baseFee = isExpress ? 50000 : 30000;
    const shipping = subtotal >= 500000 ? 0 : baseFee;
    const total = subtotal + shipping;
    const order = await Order.create({
      user: req.user._id,
      orderCode: genOrderCode(),
      items: lineItems,
      subtotal,
      shipping,
      total,
      shippingMethod: isExpress ? "express" : "standard",
      status: "processing",
      shippingAddress: shippingAddress || {},
      timeline: [
        {
          label: "Đã đặt hàng",
          detail: "Đơn hàng đã được ghi nhận",
          at: new Date(),
        },
      ],
    });
    const plain = await Order.findById(order._id).lean();
    res.status(201).json(plain);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/mine", auth(true), async (req, res) => {
  try {
    const status = req.query.status;
    const filter = { user: req.user._id };
    if (status && status !== "all") filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/:id", auth(true), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("items.product", "slug name images")
      .lean();
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
