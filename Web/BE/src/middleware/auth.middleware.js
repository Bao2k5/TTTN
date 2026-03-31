// src/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ msg: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token invalid" });
  }
};

// Optional auth - không bắt buộc login, nhưng nếu có token thì parse
exports.optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch (err) {
    req.user = null;
  }
  next();
};

exports.isAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: "Not authenticated" });
  const user = await User.findById(req.user.id);
  if (user && user.role === "admin") return next();
  return res.status(403).json({ msg: "Require admin role" });
};
