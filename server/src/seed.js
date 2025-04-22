const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { seedDatabase } = require("./config/seedData");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    return seedDatabase();
  })
  .then(() => {
    console.log("Database seeded successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
