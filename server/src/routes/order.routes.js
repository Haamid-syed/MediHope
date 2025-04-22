const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderById,
} = require("../controllers/order.controller");
const { protect, authorize } = require("../middleware/auth");

// Protected routes
router.post("/", protect, authorize("buyer", "ngo"), createOrder);
router.get("/user", protect, getUserOrders);
router.get("/seller", protect, authorize("seller", "ngo"), getSellerOrders);
router.put(
  "/:id/status",
  protect,
  authorize("seller", "ngo"),
  updateOrderStatus
);
router.put("/:id/cancel", protect, cancelOrder);
router.get("/:id", protect, getOrderById);

module.exports = router;
