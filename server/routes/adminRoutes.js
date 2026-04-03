const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const User = require("../models/User");
const PaymentConfig = require("../models/PaymentConfig");
const ContactConfig = require("../models/ContactConfig");
const { auth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/requireAdmin");
const { slugify } = require("../utils/slugify");

const router = express.Router();
const adminOnly = [auth(true), requireAdmin];

const productUploadDir = path.join(__dirname, "..", "uploads", "products");
fs.mkdirSync(productUploadDir, { recursive: true });

const productImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, productUploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const safe = allowed.includes(ext) ? ext : ".jpg";
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safe}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error("Chỉ chấp nhận ảnh JPEG, PNG, GIF, WebP"));
  },
});

router.use(adminOnly);

router.post("/upload/product-image", (req, res) => {
  productImageUpload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Lỗi upload" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Thiếu file ảnh" });
    }
    res.json({ url: `/uploads/products/${req.file.filename}` });
  });
});

router.get("/dashboard", async (req, res) => {
  try {
    const [
      productCount,
      categoryCount,
      orderCount,
      userCount,
      revenueAgg,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("user", "name email")
        .lean(),
    ]);
    const revenue = revenueAgg[0]?.total || 0;
    const byStatus = await Order.aggregate([
      { $group: { _id: "$status", n: { $sum: 1 } } },
    ]);
    res.json({
      productCount,
      categoryCount,
      orderCount,
      userCount,
      revenue,
      byStatus: Object.fromEntries(byStatus.map((x) => [x._id, x.n])),
      recentOrders,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/payment-config", async (req, res) => {
  try {
    const doc = await PaymentConfig.getSingleton();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch("/payment-config", async (req, res) => {
  try {
    const doc = await PaymentConfig.getSingleton();
    const b = req.body;
    const fields = [
      "momoQrImageUrl",
      "bankQrImageUrl",
      "bankName",
      "bankAccountNumber",
      "bankAccountName",
      "transferNote",
    ];
    for (const k of fields) {
      if (b[k] !== undefined) doc[k] = typeof b[k] === "string" ? b[k].trim() : String(b[k] ?? "");
    }
    await doc.save();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/contact-config", async (req, res) => {
  try {
    const doc = await ContactConfig.getSingleton();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch("/contact-config", async (req, res) => {
  try {
    const doc = await ContactConfig.getSingleton();
    const b = req.body;
    const fields = [
      "displayName",
      "footerTagline",
      "email",
      "phone",
      "hotline",
      "address",
      "openingHours",
      "zalo",
      "facebookUrl",
    ];
    for (const k of fields) {
      if (b[k] !== undefined) doc[k] = typeof b[k] === "string" ? b[k].trim() : String(b[k] ?? "");
    }
    await doc.save();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const items = await Category.find().sort({ name: 1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, slug: rawSlug, icon } = req.body;
    if (!name) return res.status(400).json({ message: "Thiếu tên danh mục" });
    let slug = rawSlug ? slugify(rawSlug) : slugify(name);
    const exists = await Category.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    const cat = await Category.create({
      name: name.trim(),
      slug,
      icon: icon || "shopping_basket",
    });
    res.status(201).json(cat);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put("/categories/:id", async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Không tìm thấy" });
    const { name, slug: rawSlug, icon } = req.body;
    if (name != null) cat.name = name.trim();
    if (rawSlug != null) cat.slug = slugify(rawSlug);
    if (icon != null) cat.icon = icon;
    await cat.save();
    res.json(cat);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const inUse = await Product.exists({ category: req.params.id });
    if (inUse) {
      return res.status(400).json({ message: "Còn sản phẩm thuộc danh mục này" });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/products", async (req, res) => {
  try {
    const { search, limit = "100", skip = "0" } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { slug: new RegExp(search, "i") },
      ];
    }
    const lim = Math.min(parseInt(limit, 10) || 100, 200);
    const sk = parseInt(skip, 10) || 0;
    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ updatedAt: -1 })
        .skip(sk)
        .limit(lim)
        .lean(),
      Product.countDocuments(filter),
    ]);
    res.json({ items, total });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/products", async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || body.price == null || !body.category) {
      return res.status(400).json({ message: "Thiếu tên, giá hoặc danh mục" });
    }
    const cat = await Category.findById(body.category);
    if (!cat) return res.status(400).json({ message: "Danh mục không hợp lệ" });
    let slug = body.slug ? slugify(body.slug) : slugify(body.name);
    if (await Product.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`;
    const product = await Product.create({
      name: body.name.trim(),
      slug,
      description: body.description || "",
      shortDescription: body.shortDescription || "",
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice != null ? Number(body.compareAtPrice) : undefined,
      images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],
      category: body.category,
      stock: Number(body.stock) || 0,
      badgeFresh: Boolean(body.badgeFresh),
      badgeSale: Boolean(body.badgeSale),
      origin: body.origin || "",
      featured: Boolean(body.featured),
    });
    const populated = await Product.findById(product._id)
      .populate("category", "name slug icon")
      .lean();
    res.status(201).json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy" });
    const b = req.body;
    if (b.name != null) product.name = b.name.trim();
    if (b.slug != null) product.slug = slugify(b.slug);
    if (b.description != null) product.description = b.description;
    if (b.shortDescription != null) product.shortDescription = b.shortDescription;
    if (b.price != null) product.price = Number(b.price);
    if (b.compareAtPrice != null) product.compareAtPrice = Number(b.compareAtPrice);
    if (Array.isArray(b.images)) product.images = b.images.filter(Boolean);
    if (b.category != null) {
      const cat = await Category.findById(b.category);
      if (!cat) return res.status(400).json({ message: "Danh mục không hợp lệ" });
      product.category = b.category;
    }
    if (b.stock != null) product.stock = Number(b.stock);
    if (b.badgeFresh != null) product.badgeFresh = Boolean(b.badgeFresh);
    if (b.badgeSale != null) product.badgeSale = Boolean(b.badgeSale);
    if (b.origin != null) product.origin = b.origin;
    if (b.featured != null) product.featured = Boolean(b.featured);
    await product.save();
    const populated = await Product.findById(product._id)
      .populate("category", "name slug icon")
      .lean();
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const { status, limit = "50", skip = "0" } = req.query;
    const filter = {};
    const allowedStatus = ["processing", "completed", "cancelled", "in_transit"];
    if (status && allowedStatus.includes(String(status))) {
      filter.status = status;
    }
    const lim = Math.min(parseInt(limit, 10) || 50, 100);
    const sk = parseInt(skip, 10) || 0;
    const [items, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(sk)
        .limit(lim)
        .lean(),
      Order.countDocuments(filter),
    ]);
    res.json({ items, total });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "slug name images")
      .lean();
    if (!order) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy" });
    const { status, timelineNote } = req.body;
    if (status) {
      const allowed = ["processing", "completed", "cancelled", "in_transit"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }
      order.status = status;
    }
    if (timelineNote) {
      order.timeline = order.timeline || [];
      order.timeline.push({
        label: "Cập nhật",
        detail: timelineNote,
        at: new Date(),
      });
    }
    await order.save();
    const populated = await Order.findById(order._id)
      .populate("user", "name email")
      .lean();
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
