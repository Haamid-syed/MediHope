# MedConnect

MedConnect is a platform for buying and selling medicines, connecting buyers, sellers, NGOs, and pharmacists.

## Features

- User authentication (register, login, logout)
- Role-based access control (buyer, seller, NGO, pharmacist)
- Medicine listing and search
- Shopping cart functionality
- Order placement and tracking
- Seller dashboard for managing medicines
- Pharmacist dashboard for verifying medicines

## Tech Stack

- Frontend: React, Redux Toolkit, Material-UI, Framer Motion
- Backend: Node.js, Express
- Database: MongoDB (local or Atlas)
- Authentication: JWT (JSON Web Tokens)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Database Setup Options

#### Option 1: Local MongoDB

1. Install MongoDB Community Edition on your machine:
   - [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
2. Start the MongoDB service
3. Create a `.env` file in the `server` directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/medconnect
   JWT_SECRET=your_jwt_secret
   PORT=5001
   ```

#### Option 2: MongoDB Atlas (Cloud)

1. Create a free MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Create a new project and cluster:
   - Click "Build a Database"
   - Choose the free tier (M0)
   - Select a cloud provider and region
   - Click "Create Cluster"
3. Set up database access:
   - Go to "Database Access" under Security
   - Click "Add New Database User"
   - Choose Password authentication
   - Enter a username and password (remember these)
   - Set privileges to "Read and Write to any database"
   - Click "Add User"
4. Set up network access:
   - Go to "Network Access" under Security
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" for development (you can restrict this later)
   - Click "Confirm"
5. Get your connection string:
   - Go to "Database" in the sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `<dbname>` with `medconnect`
6. Create a `.env` file in the `server` directory with the following variables:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5001
   ```
   Replace `your_mongodb_atlas_connection_string` with the connection string from MongoDB Atlas
   Replace `your_jwt_secret` with a secure random string (e.g., `medconnect-secret-key`)

### Installation

1. Install root dependencies:

   ```
   npm install
   ```

2. Install server dependencies:

   ```
   cd server
   npm install
   ```

3. Install client dependencies:
   ```
   cd client
   npm install
   ```

### Database Seeding

To populate the database with initial data:

```
cd server
npm run seed
```

This will create sample users, medicines, and orders.

### Running the Application

1. Start the development server:

   ```
   npm run dev
   ```

   This will start both the backend server and the frontend client.

2. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5001/api](http://localhost:5001/api)

### Sample User Accounts

After seeding the database, you can use the following accounts to test different roles:

- Admin:

  - Email: admin@example.com
  - Password: password123

- Seller:

  - Email: seller@example.com
  - Password: password123

- Buyer:

  - Email: buyer@example.com
  - Password: password123

- Pharmacist:

  - Email: pharmacist@example.com
  - Password: password123

- NGO:
  - Email: ngo@example.com
  - Password: password123

## Troubleshooting

### MongoDB Connection Issues

- If you're using MongoDB Atlas and getting connection errors, make sure:

  - Your IP address is whitelisted in the Network Access settings
  - Your database username and password are correct in the connection string
  - You've replaced `<password>` and `<dbname>` in the connection string
  - Your cluster is up and running

- If you're using local MongoDB and getting connection errors, make sure:
  - MongoDB service is running on your machine
  - The port in your connection string matches the MongoDB port (default is 27017)

### Port Already in Use

- If you get an error that port 3000 or 5001 is already in use:
  - Find the process using the port: `lsof -i :PORT_NUMBER`
  - Kill the process: `kill -9 PID`
  - Restart the application

## License

This project is licensed under the MIT License.
