const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// Uncomment MongoDB connection
const connectDB = require("./config/db");
const User = require("./models/User");
const Medicine = require("./models/Medicine");
const Order = require("./models/Order");

// Load environment variables
dotenv.config();

// Uncomment MongoDB connection
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "medconnect-secret-key";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Auth middleware
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber: phoneNumber || "1234567890", // Default phone number if not provided
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/auth/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Medicine routes
app.use("/api/medicines", require("./routes/medicine.routes"));

// Seller medicine routes
app.get("/api/medicines/seller/medicines", protect, async (req, res) => {
  try {
    // Get seller ID from auth token
    const sellerId = req.user._id;

    const sellerMedicines = await Medicine.find({ seller: sellerId });
    res.json(sellerMedicines);
  } catch (error) {
    console.error("Error fetching seller medicines:", error);
    res.status(500).json({ message: "Failed to fetch seller medicines" });
  }
});

app.post("/api/medicines", protect, async (req, res) => {
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

    // Check if user is a seller or NGO
    if (req.user.role !== "seller" && req.user.role !== "ngo") {
      return res.status(403).json({ message: "Not authorized as a seller" });
    }

    const newMedicine = await Medicine.create({
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
      images: images || ["https://via.placeholder.com/150"], // Default image if not provided
      seller: req.user._id,
      storageConditions,
      prescriptionRequired: prescriptionRequired || false,
      status: "available",
      verificationStatus: "pending",
    });

    res.status(201).json(newMedicine);
  } catch (error) {
    console.error("Error adding medicine:", error);
    res.status(500).json({ message: "Failed to add medicine" });
  }
});

// Pharmacist routes
app.get("/api/medicines/verification/pending", protect, async (req, res) => {
  try {
    // Check if user is a pharmacist
    if (req.user.role !== "pharmacist") {
      return res
        .status(403)
        .json({ message: "Not authorized as a pharmacist" });
    }

    const pendingMedicines = await Medicine.find({
      verificationStatus: "pending",
    }).populate("seller", "name email");

    res.json(pendingMedicines);
  } catch (error) {
    console.error("Error fetching pending medicines:", error);
    res.status(500).json({ message: "Failed to fetch pending medicines" });
  }
});

app.put("/api/medicines/:id/verify", protect, async (req, res) => {
  try {
    const { status, notes } = req.body;

    // Check if user is a pharmacist
    if (req.user.role !== "pharmacist") {
      return res
        .status(403)
        .json({ message: "Not authorized as a pharmacist" });
    }

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    medicine.verificationStatus = status;
    medicine.verificationNotes = notes;
    medicine.verifiedBy = req.user._id;
    medicine.verificationDate = Date.now();

    const updatedMedicine = await medicine.save();
    res.json(updatedMedicine);
  } catch (error) {
    console.error("Error verifying medicine:", error);
    res.status(500).json({ message: "Failed to verify medicine" });
  }
});

// Order routes
app.post("/api/orders", protect, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, city, state, zipCode, phone } =
      req.body;

    // Create order items with medicine details
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const medicine = await Medicine.findById(item.medicineId);

        if (!medicine) {
          throw new Error(`Medicine with ID ${item.medicineId} not found`);
        }

        // Check if enough quantity is available
        if (medicine.quantity < item.quantity) {
          throw new Error(`Not enough quantity available for ${medicine.name}`);
        }

        // Update medicine quantity
        medicine.quantity -= item.quantity;
        await medicine.save();

        return {
          medicineId: item.medicineId,
          name: medicine.name,
          quantity: item.quantity,
          price: item.price,
          image: medicine.images[0],
        };
      })
    );

    const newOrder = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      city,
      state,
      zipCode,
      phone,
      totalAmount,
      status: "pending",
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "Failed to create order", error: error.message });
  }
});

app.get("/api/orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get("/api/orders/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order && order.user.toString() === req.user._id.toString()) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!", error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
