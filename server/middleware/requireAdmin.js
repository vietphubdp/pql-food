function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền quản trị" });
  }
  next();
}

module.exports = { requireAdmin };
