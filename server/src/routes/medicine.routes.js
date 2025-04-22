const express = require("express");
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  verifyMedicine,
  getSellerMedicines,
} = require("../controllers/medicine.controller");
const { protect, authorize, verifyPharmacist } = require("../middleware/auth");

// Public routes
router.get("/", getMedicines);
router.get("/:id", getMedicineById);

// Protected routes
router.post("/", protect, authorize("seller", "ngo"), addMedicine);
router.put("/:id", protect, authorize("seller", "ngo"), updateMedicine);
router.delete("/:id", protect, authorize("seller", "ngo"), deleteMedicine);
router.post("/:id/verify", protect, verifyPharmacist, verifyMedicine);
router.get(
  "/seller/medicines",
  protect,
  authorize("seller", "ngo"),
  getSellerMedicines
);

module.exports = router;
