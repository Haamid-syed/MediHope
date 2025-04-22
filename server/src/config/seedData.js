const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Medicine = require("../models/Medicine");
const Order = require("../models/Order");

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      phoneNumber: "1234567890",
      address: {
        street: "123 Admin St",
        city: "Admin City",
        state: "Admin State",
        zipCode: "12345",
        country: "India",
      },
      isVerified: true,
    });

    // Create seller user
    const sellerUser = await User.create({
      name: "Seller User",
      email: "seller@example.com",
      password: "password123",
      role: "seller",
      phoneNumber: "2345678901",
      address: {
        street: "456 Seller St",
        city: "Seller City",
        state: "Seller State",
        zipCode: "23456",
        country: "India",
      },
      isVerified: true,
    });

    // Create buyer user
    const buyerUser = await User.create({
      name: "Buyer User",
      email: "buyer@example.com",
      password: "password123",
      role: "buyer",
      phoneNumber: "3456789012",
      address: {
        street: "789 Buyer St",
        city: "Buyer City",
        state: "Buyer State",
        zipCode: "34567",
        country: "India",
      },
    });

    // Create pharmacist user
    const pharmacistUser = await User.create({
      name: "Pharmacist User",
      email: "pharmacist@example.com",
      password: "password123",
      role: "pharmacist",
      phoneNumber: "4567890123",
      address: {
        street: "101 Pharmacist St",
        city: "Pharmacist City",
        state: "Pharmacist State",
        zipCode: "45678",
        country: "India",
      },
      licenseNumber: "PHARM12345",
      isVerified: true,
    });

    // Create NGO user
    const ngoUser = await User.create({
      name: "NGO User",
      email: "ngo@example.com",
      password: "password123",
      role: "ngo",
      phoneNumber: "5678901234",
      address: {
        street: "202 NGO St",
        city: "NGO City",
        state: "NGO State",
        zipCode: "56789",
        country: "India",
      },
      isVerified: true,
    });

    console.log("Users seeded successfully");
    return { adminUser, sellerUser, buyerUser, pharmacistUser, ngoUser };
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

const seedMedicines = async (users) => {
  try {
    // Clear existing medicines
    await Medicine.deleteMany({});

    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setFullYear(currentDate.getFullYear() + 2);

    const pastDate = new Date();
    pastDate.setFullYear(currentDate.getFullYear() - 1);

    // Create medicines
    const medicines = await Medicine.insertMany([
      {
        name: "Paracetamol",
        manufacturer: "Cipla",
        description: "Pain reliever and fever reducer",
        category: "Pain Relief",
        composition: "Acetaminophen 500mg",
        dosageForm: "tablet",
        strength: "500mg",
        packageSize: "10 tablets",
        batchNumber: "PARA12345",
        expiryDate: futureDate,
        manufacturingDate: pastDate,
        originalPrice: 50,
        sellingPrice: 45,
        quantity: 100,
        images: ["https://example.com/paracetamol.jpg"],
        seller: users.sellerUser._id,
        verificationStatus: "verified",
        verifiedBy: users.pharmacistUser._id,
        verificationDate: currentDate,
        storageConditions: "Store in a cool, dry place",
        prescriptionRequired: false,
        status: "available",
      },
      {
        name: "Amoxicillin",
        manufacturer: "Sun Pharma",
        description: "Antibiotic used to treat bacterial infections",
        category: "Antibiotics",
        composition: "Amoxicillin 250mg",
        dosageForm: "capsule",
        strength: "250mg",
        packageSize: "15 capsules",
        batchNumber: "AMOX67890",
        expiryDate: futureDate,
        manufacturingDate: pastDate,
        originalPrice: 120,
        sellingPrice: 110,
        quantity: 50,
        images: ["https://example.com/amoxicillin.jpg"],
        seller: users.sellerUser._id,
        verificationStatus: "verified",
        verifiedBy: users.pharmacistUser._id,
        verificationDate: currentDate,
        storageConditions: "Store below 25°C",
        prescriptionRequired: true,
        status: "available",
      },
      {
        name: "Aspirin",
        manufacturer: "Bayer",
        description: "Blood thinner and pain reliever",
        category: "Pain Relief",
        composition: "Acetylsalicylic acid 75mg",
        dosageForm: "tablet",
        strength: "75mg",
        packageSize: "14 tablets",
        batchNumber: "ASP54321",
        expiryDate: futureDate,
        manufacturingDate: pastDate,
        originalPrice: 80,
        sellingPrice: 75,
        quantity: 75,
        images: ["https://example.com/aspirin.jpg"],
        seller: users.ngoUser._id,
        verificationStatus: "verified",
        verifiedBy: users.pharmacistUser._id,
        verificationDate: currentDate,
        storageConditions: "Store in a cool, dry place",
        prescriptionRequired: false,
        status: "available",
      },
      {
        name: "Insulin",
        manufacturer: "Novo Nordisk",
        description: "Hormone used to treat diabetes",
        category: "Diabetes",
        composition: "Human Insulin 100 IU/ml",
        dosageForm: "injection",
        strength: "100 IU/ml",
        packageSize: "10ml vial",
        batchNumber: "INS98765",
        expiryDate: futureDate,
        manufacturingDate: pastDate,
        originalPrice: 500,
        sellingPrice: 450,
        quantity: 20,
        images: ["https://example.com/insulin.jpg"],
        seller: users.sellerUser._id,
        verificationStatus: "pending",
        storageConditions: "Refrigerate at 2-8°C",
        prescriptionRequired: true,
        status: "available",
      },
      {
        name: "Cetirizine",
        manufacturer: "Dr. Reddy's",
        description: "Antihistamine used to treat allergies",
        category: "Allergy",
        composition: "Cetirizine Hydrochloride 10mg",
        dosageForm: "tablet",
        strength: "10mg",
        packageSize: "10 tablets",
        batchNumber: "CET24680",
        expiryDate: futureDate,
        manufacturingDate: pastDate,
        originalPrice: 70,
        sellingPrice: 65,
        quantity: 60,
        images: ["https://example.com/cetirizine.jpg"],
        seller: users.ngoUser._id,
        verificationStatus: "verified",
        verifiedBy: users.pharmacistUser._id,
        verificationDate: currentDate,
        storageConditions: "Store below 30°C",
        prescriptionRequired: false,
        status: "available",
      },
    ]);

    console.log("Medicines seeded successfully");
    return medicines;
  } catch (error) {
    console.error("Error seeding medicines:", error);
    process.exit(1);
  }
};

const seedOrders = async (users, medicines) => {
  try {
    // Clear existing orders
    await Order.deleteMany({});

    // Create orders
    const orders = await Order.insertMany([
      {
        user: users.buyerUser._id,
        items: [
          {
            medicineId: medicines[0]._id,
            name: medicines[0].name,
            quantity: 2,
            price: medicines[0].sellingPrice,
            image: medicines[0].images[0],
          },
          {
            medicineId: medicines[2]._id,
            name: medicines[2].name,
            quantity: 1,
            price: medicines[2].sellingPrice,
            image: medicines[2].images[0],
          },
        ],
        shippingAddress: "789 Buyer St",
        city: "Buyer City",
        state: "Buyer State",
        zipCode: "34567",
        phone: "3456789012",
        totalAmount: medicines[0].sellingPrice * 2 + medicines[2].sellingPrice,
        status: "delivered",
        paymentMethod: "Cash on Delivery",
        isPaid: true,
        paidAt: new Date(),
        isDelivered: true,
        deliveredAt: new Date(),
      },
      {
        user: users.buyerUser._id,
        items: [
          {
            medicineId: medicines[1]._id,
            name: medicines[1].name,
            quantity: 1,
            price: medicines[1].sellingPrice,
            image: medicines[1].images[0],
          },
        ],
        shippingAddress: "789 Buyer St",
        city: "Buyer City",
        state: "Buyer State",
        zipCode: "34567",
        phone: "3456789012",
        totalAmount: medicines[1].sellingPrice,
        status: "processing",
        paymentMethod: "Cash on Delivery",
        isPaid: false,
      },
    ]);

    console.log("Orders seeded successfully");
    return orders;
  } catch (error) {
    console.error("Error seeding orders:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    const users = await seedUsers();
    const medicines = await seedMedicines(users);
    await seedOrders(users, medicines);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

module.exports = { seedDatabase };
