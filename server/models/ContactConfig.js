const mongoose = require("mongoose");

const contactConfigSchema = new mongoose.Schema(
  {
    displayName: { type: String, default: "PQLFood" },
    footerTagline: {
      type: String,
      default:
        "Thực phẩm tươi từ nguồn gốc rõ ràng. Rau củ, trái cây và thịt sạch cho mọi gia đình.",
    },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    hotline: { type: String, default: "" },
    address: { type: String, default: "" },
    openingHours: { type: String, default: "" },
    zalo: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

contactConfigSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model("ContactConfig", contactConfigSchema);
