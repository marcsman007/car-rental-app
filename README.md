# 🚗 MERN Car Rental App

A full-stack Car Rental Web Application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).
This app allows users to browse cars, make bookings, leave reviews, and manage rentals, while admins can add cars, manage bookings, and oversee the platform.

---

## ✨ Features

# 👤 User Features
* Register and login with JWT authentication
* Browse available cars
* Book cars and manage bookings (view, cancel, update)
* Leave reviews and ratings for cars
* Manage profile

## 🛠 Admin Features
* Add, update, and delete cars
* View all bookings
* Manage users
* Access dashboard with insights

---

## 🏗 Tech Stack

* Frontend: React.js, Context API, Axios, TailwindCSS/Bootstrap
* Backend: Node.js, Express.js
* Database: MongoDB (Mongoose ODM)
* Authentication: JWT + bcrypt
* Cloud & DevOps (optional setups):
  * AWS EC2 for hosting backend/frontend
  * S3 for static file storage
  * GitHub Actions CI/CD
  * Dockerized deployment
 
---

## 📂 Project Structure
```bash
/client       -> React frontend
/server       -> Express backend
  /models     -> MongoDB schemas
  /routes     -> API routes
  /controllers-> Request handlers
  /config     -> DB and environment configs
```

---


## 🚀 Getting Started

# 🔧 Prerequisites
Make sure you have installed:
* Node.js (>= 18)
* MongoDB (local or Atlas)
* Git

# ⚙️ Installation
1. Clone the repo:
```bash
git clone https://github.com/marcsman007/car-rental-app.git
cd car-rental-app
```

2. Install dependencies for both backend and frontend:
```bash
cd server && npm install
cd ../client && npm install
```

3. Create a .env file in /backend with:
```ini
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

4. Run the development servers:
```bash
# In two terminals
cd server && npm run dev
cd client && npm start
```

5. Visit the app at:
```arduino
http://localhost:3000
```

---

## 📦 Deployment
* Dockerized: Build and run containers
* AWS Setup: Deployed with EC2, ALB, and S3 for static assets
* CI/CD: GitHub Actions automate build and deployment

---

## 🖼 Screenshots

---

## 🛡 License
This project is licensed under the MIT License.

---

## 👨‍💻 Contributors
[Marc Jayson Macaburas](https://github.com/marcsman007) – Developer
