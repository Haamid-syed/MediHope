const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  verifyPharmacist,
} = require("../controllers/auth.controller");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.put(
  "/verify-pharmacist/:userId",
  protect,
  authorize("admin"),
  verifyPharmacist
);

module.exports = router;
