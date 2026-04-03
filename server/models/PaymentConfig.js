const mongoose = require("mongoose");

const paymentConfigSchema = new mongoose.Schema(
  {
    momoQrImageUrl: { type: String, default: "" },
    bankQrImageUrl: { type: String, default: "" },
    bankName: { type: String, default: "" },
    bankAccountNumber: { type: String, default: "" },
    bankAccountName: { type: String, default: "" },
    transferNote: { type: String, default: "" },
  },
  { timestamps: true }
);

paymentConfigSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model("PaymentConfig", paymentConfigSchema);
