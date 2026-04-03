const express = require("express");
const Product = require("../models/Product");
const Category = require("../models/Category");
const {
  isObjectIdString,
  enrichProductsWithCategories,
  enrichOneProductCategory,
} = require("../utils/enrichProductCategory");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      category: categoryParam,
      c: cParam,
      featured,
      search,
      limit = "50",
      skip = "0",
    } = req.query;
    const category = categoryParam || cParam;
    const filter = {};
    if (featured === "true") filter.featured = true;

    const andParts = [];
    if (category) {
      let cat = null;
      if (isObjectIdString(category)) {
        cat = await Category.findById(category);
      }
      if (!cat) {
        cat = await Category.findOne({ slug: category });
      }
      if (cat) {
        /* Không dùng { category: cat.slug }: schema category là ObjectId → Mongoose cast lỗi.
           Dữ liệu legacy có thể lưu slug string; $expr so sánh raw, không cast filter. */
        andParts.push({
          $or: [
            { category: cat._id },
            { $expr: { $eq: ["$category", cat.slug] } },
          ],
        });
      }
    }
    if (search) {
      andParts.push({
        $or: [
          { name: new RegExp(search, "i") },
          { description: new RegExp(search, "i") },
        ],
      });
    }
    if (andParts.length === 1) {
      Object.assign(filter, andParts[0]);
    } else if (andParts.length > 1) {
      filter.$and = andParts;
    }
    const lim = Math.min(parseInt(limit, 10) || 50, 100);
    const sk = parseInt(skip, 10) || 0;
    /* Native collection: tránh Mongoose cast { $expr + slug } thành ObjectId ở path category */
    const coll = Product.collection;
    const [items, total] = await Promise.all([
      coll.find(filter).sort({ createdAt: -1 }).skip(sk).limit(lim).toArray(),
      coll.countDocuments(filter),
    ]);
    const enriched = await enrichProductsWithCategories(items);
    res.json({ items: enriched, total });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    const enriched = await enrichOneProductCategory(product);
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    const enriched = await enrichOneProductCategory(product);
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
