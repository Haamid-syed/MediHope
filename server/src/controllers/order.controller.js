const Order = require("../models/Order");
const Medicine = require("../models/Medicine");

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      medicine,
      quantity,
      shippingAddress,
      paymentMethod,
      prescriptionImage,
    } = req.body;

    // Check if medicine exists and is available
    const medicineDoc = await Medicine.findById(medicine);
    if (!medicineDoc) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    if (medicineDoc.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient quantity available" });
    }

    if (medicineDoc.prescriptionRequired && !prescriptionImage) {
      return res.status(400).json({ message: "Prescription is required" });
    }

    // Calculate total amount
    const totalAmount = medicineDoc.sellingPrice * quantity;

    // Create order
    const order = new Order({
      buyer: req.user.id,
      seller: medicineDoc.seller,
      medicine,
      quantity,
      totalAmount,
      shippingAddress,
      paymentMethod,
      prescriptionImage,
    });

    // Update medicine quantity
    medicineDoc.quantity -= quantity;
    if (medicineDoc.quantity === 0) {
      medicineDoc.status = "sold";
    }

    await Promise.all([order.save(), medicineDoc.save()]);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate("medicine")
      .populate("seller", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get seller's orders
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate("medicine")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is the seller
    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = status;
    if (status === "delivered") {
      order.actualDeliveryDate = Date.now();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is buyer or seller
    if (
      order.buyer.toString() !== req.user.id &&
      order.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Can only cancel if order is pending or confirmed
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    // Update order status
    order.status = "cancelled";
    order.cancellationReason = cancellationReason;

    // Return quantity to medicine
    const medicine = await Medicine.findById(order.medicine);
    if (medicine) {
      medicine.quantity += order.quantity;
      medicine.status = "available";
      await medicine.save();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("medicine")
      .populate("seller", "name")
      .populate("buyer", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is buyer or seller
    if (
      order.buyer.toString() !== req.user.id &&
      order.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
