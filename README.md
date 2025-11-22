# Product Inventory Management System

A lightweight full-stack application for managing product inventory with search, filters, CSV import/export, and stock history tracking.

---

## Live Demo

**Frontend:**
[frontend-url](frontend-url)

**Backend API:**
[backend-url](backend-url)

---

## Tech Stack

- **Frontend:** React (Create React App)
- **Backend:** Node.js + Express
- **Database:** SQLite (auto-created at `backend/data.sqlite`)

---

## Features

- Product listing with search and category filter
- Create, update, and delete products
- Stock change history logging
- CSV import and export
- Simple SQLite file-based storage
- Clean and predictable REST API

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Darshanas17/Product-Inventory-Management-System.git
cd Product-Inventory-Management-System
```

---

### 2. Start the Backend

```powershell
cd backend
npm install
node index.js
```

Backend runs at:
[http://localhost:4000](http://localhost:4000)

---

### 3. Start the Frontend

Open a new terminal:

```powershell
cd frontend
npm install
npm start
```

Frontend runs at:
[http://localhost:3000](http://localhost:3000)

---

## Environment Configuration

Create a `.env` file inside the `frontend` directory:

```
REACT_APP_API_BASE=http://localhost:4000
```

This sets the backend URL for the React application.

---

## API Base URL

```
http://localhost:4000/api/products
```

Supports: list, search, CRUD, CSV import/export, and inventory logs.

---

## Access

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000/api/products](http://localhost:4000/api/products)
