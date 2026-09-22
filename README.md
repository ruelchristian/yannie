# Local Directory - Lost & Found
### A Web-Based Lost and Found Directory for ICCT Cainta

**Academic Subject:** IPT2 (Integrative Programming and Technologies 2)  
**Proponent:** Yeinnee Ruby Lavado  
**Section:** LFCA411N120  
**Instructor:** Noel Montecillo  
**Submission Date:** September 2026  

---

## 📌 Project Overview

**Local Directory - Lost & Found** is a web application designed to solve the problem of misplaced and recovered belongings across **ICCT Colleges - Cainta Campus**. It replaces scattered Facebook posts and chat messages with a single, searchable directory featuring interactive campus map tagging, photo uploads, claim verification, item status management, and administrator oversight.

---

## 🚀 Key Features

1. **Item Reporting (Lost & Found)**
   - Post lost or found items with title, detailed description, category, and date.
   - Attach photos through the integrated upload service.
   - Mark exact locations on campus (e.g. Main Gate, Canteen, Computer Lab 2, 3rd Flr Library).

2. **Interactive Campus Map Integration**
   - Built with **Leaflet** and **OpenStreetMap**, centered on **ICCT Colleges - Cainta Main Campus** (`14.61778° N, 121.10257° E` on V.V. Soliven Ave II).
   - Color-coded pins: 🔴 **Lost Items** vs 🟢 **Found Items**.
   - Interactive popups with item photo previews and quick detail access.

3. **Smart Search & Multi-Filters**
   - Real-time text search across titles, descriptions, and campus spots.
   - Category filtering (Student ID & Documents, Electronics, Bags, Stationery, Accessories, Clothing).
   - Status filtering (`ACTIVE`, `CLAIMED`, `RETURNED`, `CLOSED`).

4. **Lifecycle & Claim Management**
   - Report owners can transition status as recovery progresses (`ACTIVE` ➔ `CLAIMED` ➔ `RETURNED` ➔ `CLOSED`).
   - Claim inquiry form allowing students/staff to submit proof of ownership notes.

5. **Role-Based Authentication**
   - Secure registration and login using **JWT** and **bcrypt** password hashing.
   - Roles: `STUDENT`, `STAFF`, and `ADMIN`.

6. **Administrator Oversight Panel**
   - Real-time metrics: Total reports, active lost items, resolved items, user count.
   - Direct content moderation: Review, update status, or remove inappropriate posts.
   - User account management and role promotions.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons | Responsive modern web client |
| **Mapping** | Leaflet, React-Leaflet, OpenStreetMap | Campus map pinpoints and location picker |
| **Backend** | Node.js, Express.js | REST API, validation, routing |
| **Database** | MySQL 8.0, Prisma ORM | Relational models, migrations, seeders |
| **File Upload** | Multer | Multipart photo storage and preview |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs | Secure session and role enforcement |
| **Container** | Docker & Docker Compose | Containerized local MySQL database |

---

## 🏃 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) & Docker Compose (for local MySQL)

### 1. Clone & Setup
```bash
git clone <repo-url>
cd yannie
```

### 2. Start Local MySQL Database
```bash
docker compose up -d
```
> *This starts MySQL 8.0 on port `3306` with database `icct_lost_found`.*

### 3. Push Database Schema & Run Seeder
```bash
# Apply Prisma schema to MySQL
npm run db:push

# Populate default categories, users, and sample ICCT Cainta reports
npm run db:seed
```

### 4. Start Development Servers
```bash
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Healthcheck**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo & Test Accounts

| Role | Email / Student ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@icct.edu.ph` / `ADMIN-001` | `admin123` | Full access to `/admin` moderation & user management |
| **Student** | `yeinnee@icct.edu.ph` / `2023-01042` | `student123` | Report items, view directory, file claims |
| **Campus Security / Staff** | `security@icct.edu.ph` / `STAFF-020` | `staff123` | Surrender found items, update return status |

*(Quick 1-click test buttons are also built directly into the Login screen for testing).*

---

## 📁 Project Structure

```
yannie/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ItemCard, DirectoryMap, MapPicker, Modals
│   │   ├── context/            # AuthContext (JWT session state)
│   │   ├── pages/              # Home, CampusMapPage, Login, Register, MyDashboard, AdminDashboard
│   │   ├── services/           # API helper functions
│   │   ├── App.jsx             # Routes & layout wrapper
│   │   └── main.jsx            # Entry point
│   ├── index.html              # HTML shell with Leaflet styles
│   └── package.json
│
├── server/                     # Backend API (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # MySQL database models
│   │   └── seed.js             # Initial database seeder
│   ├── src/
│   │   ├── controllers/        # auth, item, category, and admin controllers
│   │   ├── middleware/         # auth (JWT) and upload (Multer) middleware
│   │   ├── routes/             # REST API routes
│   │   └── server.js           # Express app entry point
│   ├── uploads/                # Static uploaded item photos
│   └── package.json
│
├── docker-compose.yml          # Local MySQL container config
├── package.json                # Root orchestration scripts
└── README.md                   # System documentation
```

---

## 🌐 Deployment (Render / Vercel)

### Deploying Database
- Create a MySQL instance on [Render](https://render.com) or Aiven.
- Set the connection string in `DATABASE_URL` environment variable.

### Deploying Backend (Render Web Service)
- Root Directory: `server`
- Build Command: `npm install && npx prisma generate`
- Start Command: `node src/server.js`
- Environment Variables:
  - `DATABASE_URL`: Your MySQL URL
  - `JWT_SECRET`: A secure random secret
  - `CLIENT_URL`: URL of your frontend deployment

### Deploying Frontend (Vercel / Render Static Site)
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
