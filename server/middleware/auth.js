const jwt = require("jsonwebtoken");
const User = require("../models/User");

function auth(required = true) {
  return async function (req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      if (required) return res.status(401).json({ message: "Chưa đăng nhập" });
      req.user = null;
      return next();
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      const user = await User.findById(payload.userId).select("-password");
      if (!user) return res.status(401).json({ message: "Tài khoản không hợp lệ" });
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ message: "Phiên đăng nhập hết hạn" });
    }
  };
}

module.exports = { auth };
