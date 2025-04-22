const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    composition: {
      type: String,
      required: true,
    },
    dosageForm: {
      type: String,
      required: true,
      enum: [
        "tablet",
        "capsule",
        "syrup",
        "injection",
        "cream",
        "ointment",
        "other",
      ],
    },
    strength: {
      type: String,
      required: true,
    },
    packageSize: {
      type: String,
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    manufacturingDate: {
      type: Date,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationDate: {
      type: Date,
    },
    verificationNotes: {
      type: String,
    },
    storageConditions: {
      type: String,
      required: true,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["available", "sold", "reserved"],
      default: "available",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt timestamp before saving
medicineSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual field for checking if medicine is expired
medicineSchema.virtual("isExpired").get(function () {
  return Date.now() > this.expiryDate;
});

// Index for efficient queries
medicineSchema.index({
  name: "text",
  manufacturer: "text",
  description: "text",
  category: "text",
});
medicineSchema.index({ verificationStatus: 1, status: 1 });
medicineSchema.index({ expiryDate: 1 });

const Medicine = mongoose.model("Medicine", medicineSchema);

module.exports = Medicine;
