const Medicine = require("../models/Medicine");
const User = require("../models/User");

// Get all medicines with filters and search
exports.getMedicines = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, status, verificationStatus } =
      req.query;
    const query = {};

    // Only filter by verification status if explicitly requested
    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    // Only filter by status if explicitly requested
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { manufacturer: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }

    console.log("Medicine search query:", JSON.stringify(query, null, 2));

    const medicines = await Medicine.find(query)
      .populate("seller", "name rating")
      .sort({ createdAt: -1 });

    console.log(`Found ${medicines.length} medicines`);
    res.json(medicines);
  } catch (error) {
    console.error("Error in getMedicines:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single medicine
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate("seller", "name rating")
      .populate("verifiedBy", "name");

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new medicine
exports.addMedicine = async (req, res) => {
  try {
    const {
      name,
      manufacturer,
      description,
      category,
      composition,
      dosageForm,
      strength,
      packageSize,
      batchNumber,
      expiryDate,
      manufacturingDate,
      originalPrice,
      sellingPrice,
      quantity,
      images,
      storageConditions,
      prescriptionRequired,
    } = req.body;

    const medicine = new Medicine({
      name,
      manufacturer,
      description,
      category,
      composition,
      dosageForm,
      strength,
      packageSize,
      batchNumber,
      expiryDate,
      manufacturingDate,
      originalPrice,
      sellingPrice,
      quantity,
      images,
      storageConditions,
      prescriptionRequired,
      seller: req.user.id,
    });

    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    // Check ownership
    if (medicine.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedMedicine);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    // Check ownership
    if (medicine.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await medicine.remove();
    res.json({ message: "Medicine removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify medicine
exports.verifyMedicine = async (req, res) => {
  try {
    const { verificationStatus, verificationNotes } = req.body;
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    // Check if user is a verified pharmacist
    const pharmacist = await User.findById(req.user.id);
    if (
      !pharmacist ||
      pharmacist.role !== "pharmacist" ||
      !pharmacist.isVerified
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    medicine.verificationStatus = verificationStatus;
    medicine.verificationNotes = verificationNotes;
    medicine.verifiedBy = req.user.id;
    medicine.verificationDate = Date.now();

    await medicine.save();
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get seller's medicines
exports.getSellerMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ seller: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
