const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email đã được sử dụng" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      phone: phone || "",
    });
    const token = signToken(user._id.toString());
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Nhập email và mật khẩu" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    const token = signToken(user._id.toString());
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Nhập email và mật khẩu" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Tài khoản không có quyền quản trị" });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    const token = signToken(user._id.toString());
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/me", auth(true), async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      avatarUrl: req.user.avatarUrl,
      role: req.user.role || "user",
      createdAt: req.user.createdAt,
    },
  });
});

router.patch("/me", auth(true), async (req, res) => {
  try {
    const { name, phone, avatarUrl } = req.body;
    if (name != null) req.user.name = name;
    if (phone != null) req.user.phone = phone;
    if (avatarUrl != null) req.user.avatarUrl = avatarUrl;
    await req.user.save();
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        avatarUrl: req.user.avatarUrl,
        role: req.user.role || "user",
        createdAt: req.user.createdAt,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
