require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");

const categories = [
  { name: "Rau củ", slug: "rau-cu", icon: "eco" },
  { name: "Hải sản", slug: "hai-san", icon: "set_meal" },
  { name: "Thịt tươi", slug: "thit-tuoi", icon: "restaurant" },
  { name: "Trái cây", slug: "trai-cay", icon: "nutrition" },
  { name: "Đồ khô", slug: "do-kho", icon: "bakery_dining" },
  { name: "Combo gia đình", slug: "combo-gia-dinh", icon: "shopping_basket" },
];

const products = [
  {
    slug: "sup-lo-xanh-da-lat",
    name: "Súp lơ xanh Đà Lạt",
    description:
      "Súp lơ hữu cơ từ khí hậu mát Đà Lạt, giàu vitamin K, C và chất xơ. Tuyển chọn từng bông tươi giòn mỗi sáng.",
    shortDescription: "Hữu cơ GlobalGAP, thu hoạch lúc bình minh.",
    price: 35000,
    compareAtPrice: 45000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB6V726D7beFjk9DKoT6jmfMSCuwHxUu_qL4KXm40rqQkUyoL3EBzJHohWVAN85Zd0Dvf2DfVUdcmqSb8U9pZCjf3bXmTLvFaEQUNdIXG_znXmUBwikk8GIj0alGaM_B6bXPbvDCLuaX-tfW8KVrfhhmWPz11WmHr46DDD8e4fLJBqSfwQj_7PjnxeClWkSgUv31LS4b-FYdEMCuFTIfxZTu8Hssdqm9I5D7pUJP9Eatc-1IY2hp6t6FxvaQdsC8D2Wz0BfSnDLRCs",
    ],
    categorySlug: "rau-cu",
    stock: 80,
    badgeFresh: true,
    badgeSale: false,
    origin: "Đà Lạt, Việt Nam",
    featured: true,
  },
  {
    slug: "ca-hoi-tuoi-na-uy",
    name: "Cá hồi tươi Na Uy",
    description:
      "Phi lê cá hồi đông lạnh nhanh, thớ thịt cam óng, thích hợp sashimi và áp chảo.",
    shortDescription: "Nhập khẩu Na Uy, bảo quản lạnh chuẩn.",
    price: 285000,
    compareAtPrice: 350000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDD4uIBTPVTqUy07nVZlLtWFuDy74xO7y2KU3KtSTIhY1fVyyT8m5fTMnLkZUx2CioP9rj3vD5IUT7MKP5HcykmORZTIcWS_oU2bGRg9MptPfGCtHfv4iZ900wlso7X8BC2mXPEPlDZYjDhktboZ5TLIZ9VZo1HTkdRZrqQwlu7k0Wzp6TFi_qSy6yc01SgFk-Z9pnBtzUdJJb588GnOwhCLX_DKUDXNgGA1ba8tCcWq-6VSub48QvlwDF_3LpiyV1rHaAIdWhitlo",
    ],
    categorySlug: "hai-san",
    stock: 35,
    badgeFresh: true,
    badgeSale: true,
    origin: "Na Uy",
    featured: true,
  },
  {
    slug: "nho-mau-don-shine-muscat",
    name: "Nho mẫu đơn (Shine Muscat)",
    description:
      "Nho xanh trong, vị ngọt thanh đặc trưng, nhập tuyển theo mùa.",
    shortDescription: "Trái căng mọng, giòn tan.",
    price: 590000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgoELsr5zoOv7WWZCS-8F7mjNR5Qpq9vkW0o7dzW_NeyBOWYzJaShTu9bD_raA5cPwtU-x6C3dQLKnc5qjbi0dEs6ewO4SGqDtm4XH4Z90N-tXjthneCCkPGxy8NnUyjpDJv48shPo4HILk2cPo84CeWR5JFb1Uw4dv1fVV_mnErSKzGryQyeJqGlDuQZQ1ekUybt3VIYJSW_UJqa1_HtMDa7iBrs_ZQ-qKSxyQx_pypMiZhzAB2UrHmWFFFCwW7Z_4Nrcm4-1Yb8",
    ],
    categorySlug: "trai-cay",
    stock: 20,
    badgeFresh: true,
    badgeSale: false,
    origin: "Nhật Bản",
    featured: true,
  },
  {
    slug: "thit-bo-my-cao-cap",
    name: "Thịt bò Mỹ cao cấp",
    description:
      "Thăn ngoại bò Mỹ có vân mỡ marble, phù hợp steak và BBQ.",
    shortDescription: "Cắt lát theo yêu cầu, đông lạnh IQF.",
    price: 125000,
    compareAtPrice: 160000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBC8maPTAsQu25bEnfYtIhNHdVpur5CBjfsWjF9ke4lQMd9nqI2ciJRkx3UIGYQAXJbb9Ngw2XBAiVaNvkhnUfN6A6jjfiB3qXMYIW9HTRV_p3C39hAZm8p6ysAsSlWsaAhzlc6xT-6IzOnRBTMk9Rq9-6rnfEG8snuSvtKzbZYOhuxHenKbcsXjPQ3x3gwp400fJLUy4Euht9fvPH5dNHi57-VxtIm3yji0pKYX3zAfmr-EoVJN5zopABldtJBqLvbeInvLiO6oZ0",
    ],
    categorySlug: "thit-tuoi",
    stock: 45,
    badgeFresh: true,
    badgeSale: true,
    origin: "Hoa Kỳ",
    featured: true,
  },
  {
    slug: "ca-rot-huu-co",
    name: "Cà rốt hữu cơ",
    description: "Cà rốt Đà Lạt ngọt tự nhiên, không thuốc bảo vệ thực vật.",
    shortDescription: "Rau củ rễ tuyển chọn.",
    price: 28000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAWgImb9EMeG1l5_S6XdkAkjIYmNDTjAx6p5zSOvrDHiBTCcqknqlJs1WpLkxnI1pFEb4Aw2W0an9N9E92-aohYx73WmN7a-1qBpZH2kbBErbb1GILKME1RXsKuljgtNHD9ox88oZAo-lB5p4_RR2WzaCfOZsolrMmpGm4AdGORcu5ZUo5rUoaQJjxt7P-GC1MsCjvft7JYR5hOuEq3nn4ehdSHvccq9Zarq-BKfiryMlGinICkiBpi0BBc2AAPQOmdgKYg-RffcVY",
    ],
    categorySlug: "rau-cu",
    stock: 100,
    badgeFresh: true,
    featured: false,
    origin: "Đà Lạt",
  },
  {
    slug: "mang-tay-loai-1",
    name: "Măng tây loại 1",
    description: "Măng tây xanh non, đồng đều size, xào hoặc hấp giữ ngọt.",
    shortDescription: "Nhập từ vùng ôn đới.",
    price: 65000,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-MvRRQTY22baJqO0VM6w8_rZ7J_J4Yptj5cKtIqPwNBxOYF-nRjcVbN-7nYo74qJHPlUqaHHprqtUNdhHPSJwKenkjomZOw4pYLdVRvxCoTRDvwLBwgLP8fpfUqhAQbNOpw9ExYq5mGVHzTc2ya5l2Y1MO3ZikhPVOW6SreRA-gmewzQYZLUcD_vnaqHoaxgi4LL7nKLQf9QBW76A7jEXl4_6CCpCIdlVWoWvyhKfme2hYDpRiEBCyPyhC1q0uYOmfRh_i7TuL6s",
    ],
    categorySlug: "rau-cu",
    stock: 40,
    featured: false,
    origin: "Đà Lạt",
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);
  console.log("Connected, seeding...");

  await Product.deleteMany({});
  await Category.deleteMany({});

  const catMap = {};
  for (const c of categories) {
    const doc = await Category.create(c);
    catMap[c.slug] = doc._id;
  }

  for (const p of products) {
    const { categorySlug, ...rest } = p;
    await Product.create({
      ...rest,
      category: catMap[categorySlug],
    });
  }

  console.log(`Seeded ${categories.length} categories, ${products.length} products`);

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@pqlfood.vn").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "Quản trị viên",
      email: adminEmail,
      password: hash,
      role: "admin",
    });
    console.log(`Created admin: ${adminEmail} (default password if unset: admin123)`);
  } else {
    if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
    }
    console.log(`Admin exists: ${adminEmail} (password not changed — use DB or new user if lost)`);
  }

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
