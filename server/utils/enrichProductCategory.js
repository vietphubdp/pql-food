const Category = require("../models/Category");

/** 24-char hex MongoDB ObjectId */
function isObjectIdString(val) {
  if (val == null) return false;
  return /^[a-fA-F0-9]{24}$/.test(String(val));
}

/**
 * Lean products may have category as ObjectId or (legacy) category slug string.
 * Returns the same array with category replaced by { name, slug, icon } or null.
 */
async function enrichProductsWithCategories(products) {
  if (!products || products.length === 0) return products;

  const keys = new Set();
  for (const p of products) {
    const c = p.category;
    if (c == null) continue;
    if (typeof c === "object" && c.slug) continue;
    keys.add(String(c));
  }

  const ids = [...keys].filter(isObjectIdString);
  const slugs = [...keys].filter((k) => !isObjectIdString(k));

  const [byId, bySlug] = await Promise.all([
    ids.length ? Category.find({ _id: { $in: ids } }).select("name slug icon").lean() : [],
    slugs.length ? Category.find({ slug: { $in: slugs } }).select("name slug icon").lean() : [],
  ]);

  const map = new Map();
  for (const c of [...byId, ...bySlug]) {
    map.set(String(c._id), c);
    map.set(c.slug, c);
  }

  return products.map((p) => {
    const c = p.category;
    if (c == null) return p;
    if (typeof c === "object" && c.slug != null && c.name != null) return p;
    const doc = map.get(String(c));
    return { ...p, category: doc || null };
  });
}

async function enrichOneProductCategory(product) {
  if (!product) return product;
  const [out] = await enrichProductsWithCategories([product]);
  return out;
}

module.exports = {
  isObjectIdString,
  enrichProductsWithCategories,
  enrichOneProductCategory,
};
